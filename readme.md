# Folksonomy Mobile Experiment
This repo is a generic mobile app, call *Scan and Tag*, that scans products and, for a given property:
* either tells the user what is the corresponding value
* either, if there's no value, lets the user enter a value

This app is made to **explore quick and (not so) dirty mobile usages of the [Folksonomy Engine project](https://wiki.openfoodfacts.org/Folksonomy_Engine)**. It is designed as a kind of a **template** for other apps.

*The goal of Folksonomy engine is to unleash an ocean of new usages regarding food knowledge. Folksonomy engine allows all kind of people — citizens, researchers, journalists, professionals, artists, communities, innovators... — to enrich and use Open Food Facts, thanks to free tags and properties for your own use or to enrich the shared knowledge. Open Food Facts, as the biggest open-food database in the world, already feeds hundreds of data reuses. It will allow thousands of new apps and new usages.*

# Installing the app
[The app is not yet deployed. You can build it yourself.]

# Dev
This app is a prototype. To allow as much people as possible to reuse the code or to contribute, it is based on [Apache Cordova](https://cordova.apache.org/). Contributing to the app only requires HTML, CSS and javascript skills.

# Installing the dev environement
* Install nodejs and npm
* Install Cordova globally: `npm install -g cordova`
* Install Android Studio (this is the most complicated stuf)
* create a new directory and open it in a terminal
* `git clone git@github.com:openfoodfacts/folksonomy_mobile_experiment.git`
* `cd folksonomy_mobile_experiment`
* `npm install`
* `cordova platform add browser`
* `cordova platform add android`
* Create a `pass.js` based on `pass_sample.js` and fill it with Open Food Facts credentials (you shouldn't use you own personal account)
* `cp ./www/js/pass_sample ./www/js/pass.js`
* ... should now work. To verify installation is ok:

```
cordova run browser
```

You should see a web version of the app in your browser (but scan won't work).

If you want to generate an Android mobile app:
```
cordova run android
```

We are using the [Browsync-gen2](https://github.com/DimitrisRK/cordova-plugin-browsersync-gen2) Cordova plugin to allow live reload after each code modification. To use this feature, try:
```
cordova run browser --live-reload
cordova run android --live-reload
```

# Credits
* Data by [Open Food Facts](https://world.openfoodfacts.org) contributors, under [ODbL licence](https://opendatacommons.org/licenses/odbl/1-0/).
* Photos by [Open Food Facts](https://world.openfoodfacts.org) contributors, under [Creative Commons 3.0 CC-BY-SA licence](https://creativecommons.org/licenses/by-sa/3.0/deed.en).
* [Icon](https://iconarchive.com/show/blogger-icons-by-rafiqul-hassan/Tag-2-icon.html) by Rafiqul Hassan, published at IconArchive.