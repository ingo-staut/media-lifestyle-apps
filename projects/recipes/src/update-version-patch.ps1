# Set input encoding to UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Read the contents of the file into a variable
$json = Get-Content -Path "..\media-lifestyle-apps\projects\recipes\src\version.json" -Raw -Encoding UTF8

# Convert the JSON string to a PowerShell object
$data = $json | ConvertFrom-Json

# Ask the user which version they want to update
$versionToUpdate = Read-Host "Which version do you want to update? ('major', 'minor', or 'patch')"

# Increment the appropriate version number
switch ($versionToUpdate) {
    "major" {
        $data.version.major++
        $data.version.minor = 0
        $data.version.patch = 0
    }
    "minor" {
        $data.version.minor++
        $data.version.patch = 0
    }
    "patch" {
        $data.version.patch++
    }
}

# Set the "lastChanged" property to the current timestamp
$data.lastChanged = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"

# Ask the user for the new changes
$changes = @()
do {
    $change = Read-Host "Enter a change message ('quit' or 'q' to stop):"
    if ($change -notin @('quit', 'q')) {
        $changes += $change
    }
} while ($change -notin @('quit', 'q'))

# Add a new message to the "messages" array
$newMessage = @{
    "version" = @{
        "major" = $data.version.major
        "minor" = $data.version.minor
        "patch" = $data.version.patch
    }
    "date"    = $data.lastChanged
    "changes" = $changes
}
$data.messages += $newMessage

# Convert the PowerShell object back to JSON and write it back to the file
$json = $data | ConvertTo-Json -Depth 10
Set-Content -Path "..\media-lifestyle-apps\projects\recipes\src\version.json" -Value $json -Encoding UTF8
