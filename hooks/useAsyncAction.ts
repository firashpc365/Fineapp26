
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "../components/ui/Toast";

/**
 * Enhanced hook for managing asynchronous operations with built-in:
 * 1. Loading state management
 * 2. Automated toast notifications for success/error
 * 3. Support for request cancellation via AbortController
 * 4. Prevention of state updates after component unmount
 */
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  
  // Refs to track lifecycle and active requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  // Synchronize mount status and cleanup on destruction
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Manually triggers cancellation of the current active process.
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Executes an asynchronous task with integrated lifecycle management.
   * @param action A callback receiving an AbortSignal to propagate to inner fetch/APIs.
   * @param successMessage Optional message to display upon successful resolution.
   */
  const execute = useCallback(async <T>(
    action: (signal: AbortSignal) => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    // Cancel any existing operation from this hook instance to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    
    try {
      const result = await action(controller.signal);
      
      // Only proceed if component is still active and this specific request wasn't aborted
      if (isMounted.current && !controller.signal.aborted) {
        if (successMessage) {
          showToast(successMessage, "SUCCESS");
        }
        return result;
      }
      return null;
    } catch (error: any) {
      // Gracefully handle cancellation errors
      if (error.name === 'AbortError' || controller.signal.aborted) {
        console.debug("Async action discarded: request was aborted.");
        return null;
      }

      console.error("Critical Protocol Failure:", error);
      
      // Only show error toast if the component hasn't been unmounted
      if (isMounted.current) {
        showToast(error.message || "Logic execution failed in the neural core.", "ERROR");
      }
      return null;
    } finally {
      // Reset loading state only if this was the latest request and component is alive
      if (isMounted.current && abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [showToast]);

  return { isLoading, execute, cancel };
}
