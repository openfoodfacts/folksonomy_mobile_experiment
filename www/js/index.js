/*
 * Requirements:
 * - jQuery (map function)
 * - awesomplete (autocompletion)
 */



Capture_barcode_Opts = { //DFLT
    preferFrontCamera : false, // iOS and Android
    showFlipCameraButton : true, // iOS and Android
    showTorchButton : true, // iOS and Android
    torchOn: false, // Android, launch with the torch switched on (if available)
    saveHistory: true, // Android, save scan history (default false)
    prompt : "Place a barcode inside the scan area", // Android
    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    formats : "EAN_13", // 
    orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true, // iOS disable
    disableSuccessBeep: true // iOS and Android
}

const defaultProperty = "packaging:character";
property = localStorage.getItem("property") ? localStorage.getItem("property") : defaultProperty;

//const feAPI = "http://fr.openfoodfacts.localhost:8000"; // For dev environment
const feAPI = "https://api.folksonomy.openfoodfacts.org"; // For production environment
const offURL = "https://world.openfoodfacts.org";
var bearer;
const authrenewal = 1 * 5 * 60 * 60 * 1000;

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', _init, false);


function _init() {
  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  btnSts = document.getElementById("status");
  btnScan = document.getElementById("scan");
  btnPrefs = document.getElementById("prefButton");

  btnSts.innerHTML = "Ready!";
  btnScan.onclick = function (ev) {
    btnSts.innerHTML = "Reading...";
    property = localStorage.getItem("property") ? localStorage.getItem("property") : defaultProperty;
    capture_barcode_p()
      .then( barcode => { 
        const id = barcode.text.trim();

        // https://world.openfoodfacts.org/api/v0/product/[barcode].json Open Food Facts API
        var url = 'https://world.openfoodfacts.org/api/v0/product/' + id + '.json';
        console.log("fetch: " + url);
        fetch(url)
          .then(
            response => response.json()
            )
          .then(data => displayProduct(data,id))
          .catch(err => console.log(err))

        var propertyUrl = feAPI + '/product/' + id + '/' + property;
        console.log("fetch: " + propertyUrl);
        fetch(propertyUrl)
        .then(
          response => response.json()
          )
        .then(data => displayProperty(data,id))
        .catch(err => console.log("fetch: " + propertyUrl + " - err: ", err))
      })
      .catch(err => console.log(err));
  }

  btnPrefs.onclick = function () {
    console.log("Prefs button cliked...");
    const newPropertyDiv = document.getElementById("newPropertyDiv");
    if (window.getComputedStyle(newPropertyDiv).display === 'block') {
      newPropertyDiv.style.display = "none";
    }
    else {
      newPropertyDiv.style.display = "block";
      fetch(feAPI + "/keys").
        then(function(u){ return u.json(); }).
        then(function(json){

        /* [    { "k": "knockoff_brand", "count": 25, "values": 7 },
                { "k": "packaging:has_character", "count": 18, "values": 1 }  ] */
        // map function needs jquery
        const list = $.map(json, function (value) {
                    return {
                        label: value.k + " (" + value.count + ")",
                        value: value.k
                    };
                });
        console.log(list);
        var input = document.getElementById("newProperty");
        // jquery UI autocomplete: https://jqueryui.com/autocomplete/
        //$("#fe_form_new_property").autocomplete({
        new Awesomplete(input, {
            list: list,
          });
        });
    }
  }

  document.getElementById("newPropertyForm").addEventListener('submit', function(e){
    e.preventDefault();
    console.log('Save property: ', this);
    localStorage.setItem('property', newPropertyDiv.querySelector("input[name='property']").value);
  }, false);

}


function displayProduct(data,id){
    console.log('displayProduct(data,id) - data: ', data);
    barInfo = document.getElementById('bar-info');
    info = document.getElementById('info');
    var img = document.getElementById('img');
    if(data.status){
      btnSts.textContent = data.product.product_name;
      barInfo.textContent = data.code;
      
      // If any, display thumbnail picture of the product
      if(data.product.image_front_thumb_url.length>0){
        img.src = data.product.image_front_thumb_url; 
      }
      document.getElementById('noInfo').style.visibility = "hidden";
      console.log('displayProduct(data,id) - data.product: ', data.product);
    }
    else {
      btnSts.textContent = "";
      barInfo.textContent = "Barcode " + id + " was not found in Open Food Facts database";
      img.src = "";
    }
}


function displayProperty(data,id){
  console.log('displayProperty(data,id) - data:', data);
  propertyValue = document.getElementById('propertyValue');
  if(data) {
    document.getElementById('noInfo').style.visibility = "hidden";
    propertyValue.innerHTML = `<a href="${offURL}/property/${data.k}">${data.k}</a>: ${data.v}`;
    
    console.log('displayProperty(data,id) - data.product:', data.product);
  }
  else {
    btnSts.textContent = "";
    propertyValue.innerHTML = `The property <strong><a href="${offURL}/property/${property}">${property}</a></strong> 
                                was not known for product <span class='id'>${id}</span>. `;
    propertyValue.innerHTML += "Feel free to add it!";
    console.log(`displayProperty(data,id) - launch displayPropertyForm(${property})`);
    displayPropertyForm(property,id);
  }
  console.log('displayProperty(data,id) - end');
}


function displayPropertyForm(property,id) {
  console.log('displayPropertyForm(property) - property:', property);
  let form = document.getElementById("propertyForm");
  form.innerHTML = `
    <form id='property' action='' method='GET'>
      <input type='text' name='value' placeholder='value'>
      <input type='hidden' name='property' value='${property}'>
      <input type='hidden' name='id' value='${id}'>
      <button type='submit'>Enter</button>
    </form>
    `;
  document.getElementById('property').addEventListener('submit', function(e){
    e.preventDefault();
    console.log('displayPropertyForm - => saveValue(this), this: ', this);
    saveValue(this);
  }, false);
}


function saveValue(form) {
  let id = form.querySelector("input[name='id']").value;
  let property = form.querySelector("input[name='property']").value;
  let value = form.querySelector("input[name='value']").value;
  console.log("saveValue(form) - You want to save " + value);
  if(isWellLoggedIn()) {
    addKV(id, property, value, "");
  }
  else {
    console.log("saveValue(form) - Get credential and callback");
    console.log(localStorage.getItem("username"), localStorage.getItem("password"));
    getCredentials(localStorage.getItem("username"), localStorage.getItem("password"),
      form,
      saveValue);
  }

}


function capture_barcode_p(opts) {
    //SEE: https://www.npmjs.com/package/cordova-plugin-qr-barcode-scanner
    opts = opts || Capture_barcode_Opts;
    return new Promise( (onBarCodeOk, onBarCodeError) =>
            cordova.plugins.barcodeScanner.scan( onBarCodeOk, onBarCodeError, opts));
}


function log(content, data) {
  let d = data ? data : "";
  console.log("Log - " + content, d);
}


/**
 * isWellLoggedIn: returns if the user is logged in or not
 * 
 * @returns  {boolean} - 
 */
 function isWellLoggedIn() {
  // User is not identified and has never been
  if (localStorage.getItem('bearer') === null) {
      console.log("FEUS - isWellLoggedIn() - false (bearer does not exist)");
      
      return false;
  }
  const deadLine = parseFloat(localStorage.getItem('date')) + parseFloat(authrenewal);
  //const rest = (deadLine - new Date().getTime())/1000; // Delay between deadline and now, in seconds
  //console.log("FEUS - isWellLoggedIn() - deadLine (" + deadLine + ") - new Date().getTime() (" + new Date().getTime() + ") = " + rest);
  //console.log("FEUS - isWellLoggedIn() - localStorage.getItem('date'):" + localStorage.getItem('date'));
  if (deadLine < new Date().getTime()) {
      console.log("FEUS - isWellLoggedIn() - false");
      
      return false;
  }
  else {
      bearer = localStorage.getItem('bearer');
      console.log("FEUS - isWellLoggedIn() - true - Bearer: " + bearer);

      return true;
  }
}


function getCredentials(_username, _password, data, callback) {
  console.log("FEUS - getCredentials - call " + feAPI + "/auth");
  console.log("FEUS - getCredentials - username: " + _username);
  fetch(feAPI + '/auth',{
      method: 'POST',
      headers:{
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=&username='+_username+'&password='+_password+'&scope=&client_id=&client_secret=',
  }).
      then((payload) => payload.json()).
      then((resp) => {
        console.log(resp);
        console.log(resp.access_token);
        bearer = resp.access_token;
        console.log("FEUS - getCredentials - bearer: " + bearer);
        localStorage.setItem('bearer',resp.access_token);
        localStorage.setItem('date',new Date().getTime());
        console.log("FEUS - getCredentials - data: ", data);
        callback(data);
        return;
  }).
      catch((err) => {
      console.log('FEUS - getCredentials - ERROR. Something went wrong:' + err);
  });
}


/**
 * Add a property-value pair (a declaration) to a product
 * 
 * @param {string} _code The product barcode
 * @param {string} _k  The property to add
 * @param {string} _v  The value to add
 * @param {string} _owner The owner or "" if it's a public declaration
 * @returns {string} Returns values from http POST
 * @todo returns {string} Returns if yes (0) or no (1) the new declaration has been created ?
 */
 function addKV(_code, _k, _v, _owner) {

  /* curl -X 'POST' \
              'https://api.folksonomy.openfoodfacts.org/product' \
              -H 'accept: application/json' \
              -H 'Authorization: Bearer charlesnepote__U68ee7c02-20ff-42ab-a5a7-9436df6d5300' \
              -H 'Content-Type: application/json' \
              -d '{
                  "product": "3760256070970",
                  "k": "test",
                  "v": "test1",
                  "owner": "charlesnepote"
                  }'
  */
  console.log("FEUS - addKV() - addKV(" + _code + "," + _k  + "," + _v  + "," + _owner + ")");
  console.log("FEUS - addKV() - "+
              "curl -X 'POST' \\\n" +
              "        '" + feAPI + "/product' \\\n" +
              "        -H 'accept; application/json' \\\n" +
              "        -H 'Authorization: Bearer " + bearer + "' \\\n" +
              "        -H 'Content-Type: application/json' \\\n" +
              "        -d '{ \"product\": \"" + _code + "\", \"k\": \"" + _k + "\", \"v\": \"" + _v + "\", \"owner\": \""+_owner+"\" }'");
  let resStatus = 0;
  fetch(feAPI + "/product",{
      method: 'POST',
      //mode: 'no-cors',         // no!
      //withCredentials: true,   // no! provide CORS error
      //credentials: 'include',  // no! provide CORS error
      headers: new Headers({
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + bearer,
          'Content-Type': 'application/json'
      }),
      body: '{"product": "' + _code + '", "k": "' + _k + '", "v": "' +_v + '", "owner": "' + _owner + '"}'
  }).
      then((res) => {
      resStatus = res.status;
      if (res.status == 200) {
          // update UI
          
          return res.text();
      } else {
          console.log("FEUS - addKV() - not 200 - res: ", res);
          //throw Error(res.body.json());

          return res.text();

      }
      }).
      then((res) => {
      // When API answers an 422 error, the message is included in a {detail: [{msg: "xxx"}]} object
      // When API answers a 200, the message is "ok"
      console.log("FEUS - addKV() - res: ", res);
      if(res === "ok") {
        document.getElementById("propertyForm").remove();
      }
      if(resStatus === 422) {
          const obj = JSON.parse(res);
          console.log("FEUS - addKV() - res: ", obj);
          alertUser("Error: " + obj.detail[0].msg);
      }
  }).
      catch((err) => { // network errors like 500
      console.log(`FEUS - addKV() - ERROR. Something went wrong: ${resStatus}
                   ${err}`);
  });
}
