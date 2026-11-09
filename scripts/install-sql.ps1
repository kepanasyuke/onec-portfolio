$ErrorActionPreference = "Stop"

$root = "C:\Users\Admin\AppData\Local\Temp\gigatool\sql"
$log = "$root\install.log"
New-Item -ItemType Directory -Force -Path $root | Out-Null
Start-Transcript -Path $log -Force | Out-Null

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $boot = "$root\SQL2022-SSEI-Expr.exe"

    if (-not (Test-Path $boot) -or (Get-Item $boot).Length -lt 1000000) {
        Write-Output "Downloading bootstrapper via curl..."
        & curl.exe -L --fail --retry 3 --retry-delay 2 -o $boot "https://go.microsoft.com/fwlink/?linkid=2216019"
        Write-Output "curl exit: $LASTEXITCODE"
    }
    Write-Output "Bootstrapper size: $((Get-Item $boot).Length)"

    Write-Output "Downloading media..."
    & $boot /Q /ACTION=Download /MEDIAPATH="$root\media" /MEDIATYPE=Core
    Write-Output "media exit: $LASTEXITCODE"

    $exe = Get-ChildItem "$root\media" -Recurse -Filter "SQLEXPR*.exe" -ErrorAction Stop | Select-Object -First 1
    Write-Output "Installing: $($exe.FullName)"
    & $exe.FullName /QS /ACTION=Install /FEATURES=SQLEngine /INSTANCENAME=SQLEXPRESS /SECURITYMODE=SQL /SAPWD="Your_password123" /SQLSVCACCOUNT="NT AUTHORITY\NetworkService" /SQLSYSADMINACCOUNTS="BUILTIN\Администраторы" /IACCEPTSQLSERVERLICENSETERMS /UPDATEENABLED=0
    Write-Output "install exit: $LASTEXITCODE"

    Write-Output "Enabling TCP/IP on port 1433..."
    $tcp = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"
    if (Test-Path $tcp) {
        New-ItemProperty -Path $tcp -Name "Enabled" -Value 1 -PropertyType DWord -Force | Out-Null
        New-ItemProperty -Path "$tcp\IPAll" -Name "TcpPort" -Value "1433" -PropertyType String -Force | Out-Null
        New-ItemProperty -Path "$tcp\IPAll" -Name "TcpDynamicPorts" -Value "" -PropertyType String -Force | Out-Null
        Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
        Write-Output "TCP enabled, service restarted"
    }

    Write-Output "DONE"
}
catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}
finally {
    Stop-Transcript | Out-Null
}
