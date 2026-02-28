$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Listening on http://localhost:8080/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $path = $context.Request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        # Prevent directory traversal
        $path = $path.TrimStart('/')
        $file = Join-Path -Path $PWD.Path -ChildPath $path
        
        if (Test-Path $file -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($file)
            $response.ContentLength64 = $buffer.Length
            if ($file.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($file.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($file.EndsWith(".css")) { $response.ContentType = "text/css" }
            
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
