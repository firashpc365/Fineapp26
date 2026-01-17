# PowerShell script to set up Supabase for ElitePro Financial OS
# This script will:
# 1. Check for Supabase CLI installation. If not found, it will provide instructions.
# 2. Guide the user to log in to Supabase CLI if not already authenticated.
# 3. Apply the database migrations.

function Test-SupabaseCli {
    try {
        $null = & supabase --version
        return $true
    } catch {
        return $false
    }
}

function Invoke-SupabaseMigration {
    Write-Host "Applying Supabase migrations..." -ForegroundColor Green
    try {
        & supabase migration up
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Supabase migrations applied successfully." -ForegroundColor Green
        } else {
            Write-Host "Error applying Supabase migrations. Please check the output above." -ForegroundColor Red
        }
    } catch {
        Write-Host "Failed to run Supabase migration command: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Ensure Supabase CLI is correctly installed and configured." -ForegroundColor Red
    }
}

function Main {
    Set-Location (Split-Path $MyInvocation.MyCommand.Definition -Parent)

    Write-Host "ElitePro Supabase Setup Script" -ForegroundColor Cyan
    Write-Host "-------------------------------" -ForegroundColor Cyan

    # Check for .env file
    if (-not (Test-Path ".env")) {
        Write-Warning "'.env' file not found. Please create one with SUPABASE_URL and SUPABASE_ANON_KEY."
        Write-Host "Example .env content:" -ForegroundColor Yellow
        Write-Host "VITE_SUPABASE_URL="https://your-project-ref.supabase.co"" -ForegroundColor Yellow
        Write-Host "VITE_SUPABASE_ANON_KEY="your-anon-key"" -ForegroundColor Yellow
        Write-Host "Press any key to continue after creating the .env file..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }

    # 1. Check Supabase CLI
    if (-not (Test-SupabaseCli)) {
        Write-Warning "Supabase CLI not found."
        Write-Host "Please install it using your preferred method (e.g., npm, brew, scoop):" -ForegroundColor Yellow
        Write-Host "  npm install -g supabase" -ForegroundColor Yellow
        Write-Host "  brew install supabase/supabase/supabase" -ForegroundColor Yellow
        Write-Host "  scoop install supabase" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "After installation, ensure it's in your PATH and restart your terminal."
        Write-Host "Press any key to continue after installing Supabase CLI..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

        # Re-check after user input
        if (-not (Test-SupabaseCli)) {
            Write-Error "Supabase CLI still not detected. Aborting setup."
            return
        }
    }
    Write-Host "Supabase CLI detected." -ForegroundColor Green

    # 2. Check for Supabase login
    Write-Host "Checking Supabase CLI login status..." -ForegroundColor Green
    try {
        $output = & supabase status 2>&1
        if ($output -like "*You are not logged in*") {
            Write-Warning "You are not logged in to Supabase CLI."
            Write-Host "Please log in now:" -ForegroundColor Yellow
            & supabase login
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Supabase login failed. Aborting setup."
                return
            }
        }
        Write-Host "Logged in to Supabase CLI." -ForegroundColor Green
    } catch {
        Write-Host "Could not determine Supabase login status. Attempting login." -ForegroundColor Yellow
        & supabase login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Supabase login failed. Aborting setup."
            return
        }
    }

    # 3. Apply migrations
    Invoke-SupabaseMigration
}

Main
