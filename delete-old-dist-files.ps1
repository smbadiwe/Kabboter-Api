
echo "Deleting old dist.zip file"
Remove-Item .\dist.zip

echo "Deleting old dist folder"
Remove-Item .\dist -Force -Recurse
# Remove-Item .\dist -Force -Recurse
