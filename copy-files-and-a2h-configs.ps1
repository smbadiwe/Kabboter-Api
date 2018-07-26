echo "Copying the UI files for game plays"
Copy-Item -Path ./src/public -Recurse -Destination ./dist/public/ -Container
# copy ./src/public/quizadmin/quizadmin.html ./dist/public/quizadmin/quizadmin.html
# copy ./src/public/surveyadmin/surveyadmin.html ./dist/public/surveyadmin/surveyadmin.html
# copy ./src/public/quizplayer/quizplayer.html ./dist/public/quizplayer/quizplayer.html
# copy ./src/public/surveyplayer/surveyplayer.html ./dist/public/surveyplayer/surveyplayer.html

echo "Copying config files for Azure"

copy ./package.a2h.json ./dist/package.json
copy ./.a2hosting.env ./dist/.env
copy ./.htaccess ./dist/.htaccess
copy ./process.json ./dist/process.json

echo "Done."