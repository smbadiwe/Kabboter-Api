echo "Copying the UI files for game plays"
Copy-Item -Path ./src/public -Recurse -Destination ./dist/public/ -Container

echo "Copying config files for Azure"

copy ./package.azure.json ./dist/package.json
copy ./web.azure.config ./dist/web.config
copy ./.azure.env ./dist/.env
copy ./iisnode.yml ./dist/iisnode.yml
copy ./process.json ./dist/process.json

echo "Zipping the distros"
Compress-Archive -Path ./dist/* -DestinationPath ./dist.zip -Force

echo "Deleting generated dist folder"
Remove-Item .\dist -Force -Recurse

echo "Done."