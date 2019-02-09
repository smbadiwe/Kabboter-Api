Write-Output "Copying the UI files for game plays"
Copy-Item -Path ./src/public -Recurse -Destination ./dist/public/ -Container

Write-Output "Copying config files for Azure"

Copy-Item ./package.azure.json ./dist/package.json
Copy-Item ./web.azure.config ./dist/web.config
Copy-Item ./.azure.env ./dist/.env
Copy-Item ./iisnode.yml ./dist/iisnode.yml
Copy-Item ./process.json ./dist/process.json

Write-Output "Zipping the distros"
Compress-Archive -Path ./dist/* -DestinationPath ./dist.zip -Force

Write-Output "Deleting generated dist folder"
Remove-Item .\dist -Force -Recurse

Write-Output "Done."