#DropIn
Did you ever had problems with downloads because your internet connection broke down every few minutes and some stupid programmer didn't allow you to continue the download where you liked to do? Well, we've got that problem covered.

Just run DropIn at your (node.js enabled) webserver and you'll be able to download filed directly to your Dropbox account, so that Dropbox downloads the files in the background, no matter how many times your connection crashed.

##Requirements
* node.js
* mysql
* a Dropbox app (keys have to be written to settings.js)

##Known bugs
* files > 300mb aren't allowed due to limitations of the Dropbox API

##Contributors
* Pablo Prietz (design)
* Felix Böhm (coding, everything else)