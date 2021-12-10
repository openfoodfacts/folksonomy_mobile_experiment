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
* Install Cordova
* Install Android Studio (this is the most complicated stuf)
* create a new directory and open it in a terminal
* `git clone git@github.com:openfoodfacts/folksonomy_mobile_experiment.git`
* ... should now work. To verify installation is ok:

```
cd ./folksonomy_mobile_experiment
cordova run browser
```

You should see a web version of the app in your browser (but scan won't work).

If you want to generate an Android mobile app:
```
cordova run android
```
