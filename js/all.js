// 全部資料
var publicdata = [];
// 篩選後的資料
var resultListData = [];
// google map
var map;
var infoWindow = '';
// === 當點擊enter時，執行search()
var searchbarEnter = function(){
  document.getElementById('querytext').addEventListener('keyup', function(e) {
    //if (e.keyCode === 13) {
      // if (this.value !== '') { // DOM事件的callback中，this指向DOM元素本身
        search();
      // }
    //}
  });
}
// === 搜尋時，將搜尋到的資料與標記放入地圖
var searchMap = function(data){
  console.log(data)
  var centerlocaton= {lat: parseFloat(data[0].latitude),lng:parseFloat(data[0].longitude)};
  console.log(centerlocaton);
  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 10, center: centerlocaton});
  var locationarr = {}
  for(let i = 0; i<data.length; i++) {
    locationarr[i] = {
      lat: '',
      lng: ''
    }
    locationarr[i].lat = parseFloat(data[i]['latitude'])
    locationarr[i].lng = parseFloat(data[i]['longitude'])
    var icon = {
      url: './resource/img/icon.png', // url
      scaledSize: new google.maps.Size(24, 24), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    var marker = new google.maps.Marker({
      position: locationarr[i],
      map: map,
      icon: icon
    })
    
    marker.addListener('click', (function(marker, i) {
      return function() {
          
        if (infoWindow) {
          infoWindow.close();
        }
        var phone = data[i]['r_Phone'] !== '' ? data[i]['r_Phone'] : '尚未提供'
        infoWindow = new google.maps.InfoWindow({
            content: "<div class='infoWindow'><p><img src='./resource/img/name.png'>名稱：" + data[i]['r_Title'] 
            + "</p><p><img src='./resource/img/address.png'>地址：" + data[i]['r_Address'] + '</p>' 
            + "<p><img src='./resource/img/phone.png'>電話：" + phone + '</p></div>'
        });
        infoWindow.open(map, marker);
      }
    })(marker, i));
  }

}

// === 獲取地圖並增加標示、infoWindow
function initMap() {
  var Kaohsiung= {lat: 23.105525, lng:120.684897};
  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 10, center: Kaohsiung});
  var data = publicdata
  var locationarr = {}
  
  
  
  for(let i = 0; i<data.length; i++) {
    locationarr[i] = {
      lat: '',
      lng: ''
    }
    locationarr[i].lat = parseFloat(data[i]['latitude'])
    locationarr[i].lng = parseFloat(data[i]['longitude'])
    var icon = {
      url: './resource/img/icon.png', // url
      scaledSize: new google.maps.Size(24, 24), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    var marker = new google.maps.Marker({
      position: locationarr[i],
      map: map,
      icon: icon
      
    })
    // ==== 點擊圖示後的地標內容，新增addListerner事件在點擊後會執行函數，但由於在執行時資料已經執行完，會只能抓到最後一筆資料
    // 因此使用IIFE的方式在addListener時馬上執行這個函數，這個函數會回傳一個函數，是新增infoWindow及內容，由於函數執行環境的特性，立即執行後i會保留在記憶體
    // 當點即時會執行這個被回傳的函數
    marker.addListener('click', (function(marker, i) {
      return function() {
          
        if (infoWindow) {
          infoWindow.close();
        }
        var phone = data[i]['r_Phone'] !== '' ? data[i]['r_Phone'] : '尚未提供'
        infoWindow = new google.maps.InfoWindow({
            content: "<div class='infoWindow'><p><img src='./resource/img/name.png'>名稱：" + data[i]['r_Title'] 
            + "</p><p><img src='./resource/img/address.png'>地址：" + data[i]['r_Address'] + '</p>' 
            + "<p><img src='./resource/img/phone.png'>電話：" + phone + '</p></div>' 
        });
        infoWindow.open(map, marker);
      }
    })(marker, i));
  }
}

// === 定義使用ajax呼叫API的方式
function getData(fn) {
  $.ajax({
    url: 'https://api.kcg.gov.tw/api/service/Get/35d9da28-b6be-4815-b49a-51fc076a868e',
    type: 'GET',
    async: false,
    dataType: 'json',
    success: function (data) {
      publicdata = data.data
      fn(publicdata)
    }
  })
}
// === 等待DOM載入完成後呼叫getData並傳入一個function，這個function會接收傳入的data執行迴圈，並呼叫renderHtml
$(function() {
  getData(function(result) {
    var firstHtmlString = ''
    for (var i = 0; i < result.length; i++) {
      // 將傳入的result也就是61行呼叫時的data傳入後，呼叫renderHtml對result當下的i元素進行處理，並將處理後回傳的結果放回firstHtmlString
      firstHtmlString += renderHtml(result, i)
    }
    document.getElementById('showitem').innerHTML = firstHtmlString
  })
// 等待DOM載入完成後建立一個監聽事件，當點擊query按鈕後執行search
  document.getElementById('query').addEventListener('click', function() {
    search();
  })
// 等待DOM載入完成後建立一個監聽事件，當點擊popbutton按鈕後將popup class改成display: block
  document.getElementById('popbutton').addEventListener('click',function(){
    document.getElementsByClassName('popup')[0].style.display = 'block';
  })
//
  document.getElementById('exit').addEventListener('click',function(){
    document.getElementsByClassName('popup')[0].style.display = 'none';
  })
//
  searchbarEnter();
});
// === 點擊搜尋時所執行的函數
var search = function (){
  // 先清空
  resultListData = []
  var querytext = document.getElementById('querytext').value
  // 與我們抓下來的結果publicdata的Title與Address比對，如果符合就將該筆資料放入resultListDat陣列中
  for (var i = 0; i < publicdata.length; i++) {
    if (publicdata[i]['r_Title'].indexOf(querytext) !== -1){
      resultListData.push(publicdata[i]);
    } else if (publicdata[i]['r_Address'].indexOf(querytext) !== -1){
      resultListData.push(publicdata[i]);
    }
  }
  // 將所有符合資料放入resultListData後對這些資料進行render，呼叫函數
  renderSearch()
}

// === 將搜尋符合的結果進行render的函數
var renderSearch = function () {
  // 先將要render的內容重設
  var htmlString = ''
  // 存取篩選完的resultListData，如果不是空值，執行迴圈並呼叫renderHtml處理資料，並將renderHtml回傳的值加入htmlString，如果resultListData為空表示找不到結果
  if (resultListData.length > 0){
    for (var i = 0; i < resultListData.length; i++) {
      htmlString += renderHtml(resultListData, i)
    }
    console.log(resultListData)
    searchMap(resultListData); // 如果結果不為空，呼叫searchMap更改Map標記
  } else{
    htmlString = '<li><p>找不到結果</p></li>'
  }
  // 將處理好的htmlString render到html中，如果沒有結果htmlString就是找不到結果
  document.getElementById('showitem').innerHTML = htmlString
}

// === 對傳入的資料進行處理，傳入的參數data是物件，i是數值(104行迴圈執行當下的第幾個元素)，對某些欄位進行處理後回傳一大串要準備render的字串
var renderHtml = function (data, i) {
  var phone = data[i]['r_Phone'] !== '' ? data[i]['r_Phone'] : '尚未提供' 
  var note = data[i]['r_Note'].indexOf('<br />') !== -1 ? filterBr(data[i]['r_Note']) : publicdata[i]['r_Note']
  return '<li>'
  + '<p class="li-title">' + data[i]['r_Title'] + '</p>'
  + '<p class="li-note">' + note + '</p>'
  + '<p class="li-address"> <img src="resource/img/address.png" alt="" class="li-photo">' + data[i]['r_Address'] + '</p>'
  + '<p class="li-phone"> <img src="resource/img/phone.png" alt="" class="li-photo">' + phone + '</p>'
  + '</li> ';
}

// === 篩選note資料中有存在<br/>字串的值，將其去除後放回
var filterBr = function (string) {
  var newWordArray = string.split('<br />') // 陣列
  var newWord = ''
  for (var i = 0; i < newWordArray.length; i++) {
    newWord += newWordArray[i] + '。'
  }
  return newWord // 字串
}

  

