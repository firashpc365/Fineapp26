import { GoogleGenAI, Type } from "@google/genai";
import { Scope, TransactionResult, OCRResult, QuoteItem, QuoteResult, RFQResult, ServiceItem, ClientItem } from "../types";
import { MENUS } from "../constants";

// VITE STANDARD: Access env var via import.meta.env
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Configuration Helpers ---

const getSettings = () => {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('elitepro_settings');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const getModel = () => {
  const settings = getSettings();
  return settings?.aiModelPreference === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

const getCurrency = () => {
  const settings = getSettings();
  return settings?.defaultCurrency || 'SAR';
};

/**
 * Categorizes a transaction using the configured model and currency.
 */
export const categorizeTransaction = async (input: string | { data: string, mimeType: string }): Promise<TransactionResult> => {
  const current_date = new Date().toISOString().split('T')[0];
  const currency = getCurrency();

  const parts: any[] = [];
  let model = getModel();

  if (typeof input === 'string') {
    parts.push({ text: `Input: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
    parts.push({ text: "Analyze this document/image and categorize the transaction." });
    model = 'gemini-3-pro-preview';
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      systemInstruction: `You are the AI financial engine for "ElitePro," a dual-mode finance app for a freelancer. The user has a single bank account used for both Personal and Business purposes. Your job is to analyze transaction inputs (text, images, or documents) and output a structured JSON object.

**Context & Entities:**
1. **User (Me):** Freelancer.
2. **JAG Arabia:** A proxy company. Transactions related to "Invoice Request," "JAG Transfer," or "LSA" are Business.
3. **Paul:** A partner/customer. Transactions related to "Commission," "RFQ," or "Paul" are Business.
4. **Suppliers:** Buying food, catering equipment, or labor is usually Business.
5. **Personal:** Groceries, Cinema, Family, Petrol (unless specified for a project), Rent (Home).

**Current Date:** ${current_date}
**Default Currency:** ${currency}

**Output Format (JSON Only):**
{
  "scope": "PERSONAL" | "BUSINESS" | "UNCERTAIN",
  "type": "EXPENSE" | "INCOME" | "TRANSFER",
  "category": "String (e.g., 'Food', 'Transport', 'Supplier Payment', 'JAG Settlement')",
  "amount": Number,
  "currency": "${currency}",
  "description": "Cleaned up description",
  "project_hint": "String (If input mentions a specific project, extract it here, else null)",
  "confidence_score": Number (0-1)
}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scope: { type: Type.STRING, enum: ["PERSONAL", "BUSINESS", "UNCERTAIN"] },
          type: { type: Type.STRING, enum: ["EXPENSE", "INCOME", "TRANSFER"] },
          category: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          description: { type: Type.STRING },
          project_hint: { type: Type.STRING, nullable: true },
          confidence_score: { type: Type.NUMBER }
        },
        required: ["scope", "type", "category", "amount", "currency", "description", "project_hint", "confidence_score"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Scans a receipt/invoice and extracts structured data.
 */
export const scanReceipt = async (base64Data: string, mimeType: string): Promise<OCRResult> => {
  const currency = getCurrency();
  const model = 'gemini-3-pro-preview';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this financial document. Extract the data into strict JSON format." }
      ]
    },
    config: {
      systemInstruction: `Analyze this financial document (Image, PDF, or Text). It is either a Supplier Invoice, a Receipt, or a Payment Proof.
Extract the following data into strict JSON format.

**Requirements:**
1. **Vendor:** Name of the shop/supplier.
2. **Date:** YYYY-MM-DD format.
3. **Total Amount:** The final grand total.
4. **Currency:** The detected currency (e.g., ${currency}, USD). Default to ${currency}.
5. **Line Items:** An array of items purchased (Quantity, Description, Unit Price).
6. **Tax:** Total VAT/Tax amount if visible.
7. **Doc Type:** "RECEIPT", "INVOICE", or "TRANSFER_PROOF".

**Special Logic for 'Catering':**
- If the items are food ingredients (Rice, Meat, Vegetables) in bulk, flag 'is_catering_supply' as true.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendor_name: { type: Type.STRING },
          date: { type: Type.STRING },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          tax_amount: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                qty: { type: Type.NUMBER },
                desc: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["qty", "desc", "price"]
            }
          },
          document_type: { type: Type.STRING, enum: ["RECEIPT", "INVOICE", "TRANSFER_PROOF"] },
          is_catering_supply: { type: Type.BOOLEAN }
        },
        required: ["vendor_name", "date", "total", "currency", "items", "document_type"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Generates a quote with calculated sell prices and scope of work.
 */
export const generateQuote = async (
  clientContext: string,
  items: QuoteItem[],
  commissionRate: number,
  profitMargin: number,
  deepAnalysis: boolean
): Promise<QuoteResult> => {
  const model = 'gemini-3-pro-preview';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { text: `Client Context: ${clientContext}` },
        { text: `Items (Base Cost): ${JSON.stringify(items)}` },
        { text: `Parameters: Commission ${commissionRate}%, Margin ${profitMargin}%` }
      ]
    },
    config: {
      systemInstruction: `You are an expert Cost Estimator and Proposal Writer for 'ElitePro'.
      
      **Goal:** Calculate selling prices and generate a professional Scope of Work.

      **1. Pricing Logic (STRICT):**
      - Formula: Sell Price = Base Cost / (1 - ((Margin% + Commission%) / 100))
      - Round to the nearest 5 or 10.
      - If Base Cost is 0, estimate a reasonable market Cost Price first based on the Item Description for Saudi Arabia, then apply the formula. Explain this in 'reasoning'.
      - If 'deepAnalysis' is true, provide a detailed reasoning comparing against typical market rates.

      **2. Scope of Work:**
      - Write a professional, contract-grade Scope of Work text.
      - Group items logically (e.g., '1. Logistics', '2. Catering Services', '3. Manpower').
      - Use the Client Context to tailor the tone (e.g., if client is Aramco, be very formal and mention safety/compliance if relevant).

      **Output JSON:**
      {
        "calculated_items": [{ "item": string, "base_cost": number, "suggested_sell_price": number, "reasoning": string }],
        "scope_of_work_text": string,
        "warnings": string[]
      }`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calculated_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                base_cost: { type: Type.NUMBER },
                suggested_sell_price: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              },
              required: ["item", "base_cost", "suggested_sell_price", "reasoning"]
            }
          },
          scope_of_work_text: { type: Type.STRING },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["calculated_items", "scope_of_work_text"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Analyzes an RFQ document or text to extract logistics and requirements.
 */
export const analyzeRFQ = async (input: string | { data: string, mimeType: string }): Promise<RFQResult> => {
  const model = 'gemini-3-pro-preview';
  const parts: any[] = [];

  if (typeof input === 'string') {
    parts.push({ text: `RFQ Text: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
    parts.push({ text: "Analyze this RFQ document." });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      systemInstruction: `Analyze the Request for Quotation (RFQ). Extract key logistics and suggest a menu package.
      
      **Match Logic:**
      - Compare requirements against these packages: ${JSON.stringify(MENUS.map(m => ({ id: m.id, name: m.name, items: m.items })))}
      - If no direct match, return null for 'suggested_package_id'.

      **Output JSON:**
      {
        "suggested_package_id": string | null,
        "logistics": { "date": string, "location": string, "pax": number },
        "missing_info": string[] (e.g. "Exact date", "Vegetarian options?"),
        "draft_reply_to_paul": string (A professional email draft confirming receipt and asking for missing info)
      }`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggested_package_id: { type: Type.STRING, nullable: true },
          logistics: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              pax: { type: Type.NUMBER }
            }
          },
          missing_info: { type: Type.ARRAY, items: { type: Type.STRING } },
          draft_reply_to_paul: { type: Type.STRING }
        },
        required: ["suggested_package_id", "logistics", "missing_info", "draft_reply_to_paul"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Extracts quote data from a file or text for smart import.
 */
export const extractQuoteData = async (input: string | { data: string, mimeType: string }): Promise<any> => {
  const model = 'gemini-3-pro-preview';
  const parts: any[] = [];

  if (typeof input === 'string') {
    parts.push({ text: input });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  }
  parts.push({ text: "Extract quote details into JSON. Identify Client Name, Address, VAT, CR, Dates, Terms, and Line Items (Qty, Desc, Unit Price)." });

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clientName: { type: Type.STRING },
          clientAddress: { type: Type.STRING },
          clientVat: { type: Type.STRING },
          clientCr: { type: Type.STRING },
          date: { type: Type.STRING },
          validity: { type: Type.STRING },
          terms: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                price: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Parses bulk service items from text or CSV.
 */
export const parseBulkServices = async (input: string | { data: string, mimeType: string }): Promise<ServiceItem[]> => {
  const model = 'gemini-3-flash-preview';
  const parts: any[] = [];

  if (typeof input === 'string') {
    parts.push({ text: `Raw Data: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  }
  parts.push({ text: "Extract service items. For each, determine Category (TENT, CATERING, ENTERTAINMENT, BRANDING, GIFT), Selling Price, and Cost Price (estimate cost as 60% of sell if not present)." });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["TENT", "CATERING", "BRANDING", "GIFT", "ENTERTAINMENT"] },
            selling_price: { type: Type.NUMBER },
            cost_price: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["title", "category", "selling_price", "cost_price"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Parses bulk client data.
 */
export const parseBulkClients = async (input: string | { data: string, mimeType: string }): Promise<ClientItem[]> => {
  const model = 'gemini-3-flash-preview';
  const parts: any[] = [];

  if (typeof input === 'string') {
    parts.push({ text: `Raw List: ${input}` });
  } else {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  }
  parts.push({ text: "Extract client entities. Name, Email, Phone, Location." });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            contact: { type: Type.STRING },
            address: { type: Type.STRING }
          },
          required: ["name"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Reconciles bank transactions with ledger.
 */
export const reconcileTransactions = async (bank: any[], ledger: any[]): Promise<any[]> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: `Bank Feed: ${JSON.stringify(bank)}` },
        { text: `Ledger: ${JSON.stringify(ledger)}` },
        { text: "Match transactions based on Amount (exact or close) and Date (within 3 days). Return matches with confidence score." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            bankTxId: { type: Type.STRING },
            ledgerTxId: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
