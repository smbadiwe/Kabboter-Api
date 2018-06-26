echo "Copying the UI files for game plays"
copy ./src/public/quizadmin/quizadmin.html ./dist/public/quizadmin/quizadmin.html
copy ./src/public/surveyadmin/surveyadmin.html ./dist/public/surveyadmin/surveyadmin.html
copy ./src/public/quizplayer/quizplayer.html ./dist/public/quizplayer/quizplayer.html
copy ./src/public/surveyplayer/surveyplayer.html ./dist/public/surveyplayer/surveyplayer.html

echo "Copying config files for Azure"

copy ./package.azure.json ./dist/package.json
copy ./web.azure.config ./dist/web.config
copy ./.azure.env ./dist/.env
copy ./iisnode.yml ./dist/iisnode.yml
copy ./process.json ./dist/process.json

echo "Zipping the distros"
Compress-Archive -Path ./dist/* -DestinationPath ./dist.zip -Force

echo "Done."