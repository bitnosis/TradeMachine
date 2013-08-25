$(function() {



/*
    $.getJSON('/api/trade', function(data) {
        // create the chart
        chart = new Highcharts.StockChart({
            chart : {
                renderTo : 'container'
            },
 
            title: {
                text: 'Simulated Market History'
            },
            
            xAxis: {
                gapGridLineWidth: 0
            },
            
            rangeSelector : {
                buttons : [{
                    type : 'hour',
                    count : 1,
                    text : '1h'
                }, {
                    type : 'day',
                    count : 1,
                    text : '1D'
                }, {
                    type : 'all',
                    count : 1,
                    text : 'All'
                }],
                selected : 1,
                inputEnabled : false
            },
            
            series : [{
                name : 'qqq8',
                type: 'area',
                data : data,
                gapSize: 5,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor : {
                    linearGradient : {
                        x1: 0, 
                        y1: 0, 
                        x2: 0, 
                        y2: 1
                    },
                    stops : [[0, Highcharts.getOptions().colors[0]], [1, 'rgba(0,0,0,0)']]
                },
                threshold: null
            }]
        });
    });*/
    
    function msgReceived(msg){
        $clientCounter.html(msg.clients);
    }

    function buildTABLE(market, data){

        var html="";
        var sells = data.sells.volumes;
        var buys = data.buys.volumes;
        var max = maxKey(sells);
        var min = minKey(buys);
        var length = max-min;
        var prices = [];
        var val = "";
       
        for(var i=0; i<length; i++){
            prices.push(max-i);
            val = max-i;
        }
        
        prices.push(val-1);

        $.each(prices, function(key, value){
            if(value!=-1){
                if(value in buys){
                     html += "<tr data-market='"+market+"' data-price='"+value+"'><td class='bids bidcol'>"+buys[value]+"</td><td class='price'>"+value+"</td><td class='askcol'></td></tr>";
                } 
                else if(value in sells){
                 html += "<tr data-market='"+market+"' data-price='"+value+"'><td class='bidcol'></td><td class='price'>"+value+"</td><td class='asks askcol'>"+sells[value]+"</td></tr>";
                } 
                else {
                 html += "<tr data-market='"+market+"' data-price='"+value+"'><td class='bidcol'></td><td class='price'>"+value+"</td><td class='askcol'></td></tr>";
                }
            }
        });

        $("."+market).html(html);
    }
            
    

    function maxKey(a) {  
        var max, k; // don't set max=0, because keys may have values < 0  
        for (var key in a) { if (a.hasOwnProperty(key)) { max = parseInt(key); break; }} //get any key  
        for (var key in a) { if (a.hasOwnProperty(key)) { if((k = parseInt(key)) > max) max = k; }}  
        return max;  
    } 

    function minKey(a) {  
        var min, k; // don't set max=0, because keys may have values < 0  
        for (var key in a) { if (a.hasOwnProperty(key)) { min = parseInt(key); break; }} //get any key  
        for (var key in a) { if (a.hasOwnProperty(key)) { if((k = parseInt(key)) < min) min = k; }}  
        return min;  
    } 

    $clientCounter = $('#client_count');

    var iosock = io.connect('http://localhost:5000');
    

    
    iosock.on('connect', function(){
        console.log("Connected to Trade Machine");
    });

    iosock.on('clientcon', function(msg){
        console.log(msg);
        msgReceived(msg);
    });
    
    iosock.on('completeData', function(data){
        console.log(data.market);
        var d = data.market;
        for(var i =0; i<d.length;i++){
            buildTABLE(d[i].market, d[i]);
        }
    });

    iosock.on('message', function(data){
        
    console.log(data.market);
    /*
        var buys = msg.buys.volumes;
        var sells = msg.sells.volumes;
        var html = "";
        var max = maxKey(sells);
        var min = minKey(buys);
        var length = max-min;
        var prices = [];
        var val="";

        buildTABLE(msg.market);


        //Sort the data and build ladder display
        /*Object.keys(sells).sort(function (a, b) {
        return Number(a) - Number(b);}).reverse().forEach(function(current){
            html += "<tr><td></td><td></td><td class='price asks'>"+current+"</td><td class='vol'>"+sells[current]+"</td></tr>";
        });
        Object.keys(buys).sort(function (a, b) {
        return Number(a) - Number(b);}).reverse().forEach(function (current) { 
            html += "<tr><td class='vol'>"+buys[current]+"</td><td class='price bids'>"+current+"</td><td></td><td></td></tr>";
        });*/

    });
    
    iosock.on('trade', function(data){
        //console.log(data);
    });





    //USER INTERFACE SECTION
    $('#oneclick').change(function(){
        if($(this).is(':checked')){
            if(confirm('One Click Trading is dangerous...please make sure you understand the risks')){
        	} else {
            	$(this).prop('checked', false);
       		};
       	} else {
            $(this).prop('checked', false);
        }
     });

    //TRADE BUTTON
    $('.TRADE').click(function(e){
     	e.preventDefault();
     	var data = {};
     	if($('#contracts').val()==""){
     		alert('Please Enter Contracts in Order to Trade');
     	} else if($('#price').val()==""){
     		alert('Please Enter A Price');
     	} else {
        data.price = $('#price').val();
     	data.tradetype = $(this).html();
     	data.market = $('#market').val();
     	data.contracts = $('#contracts').val();
     	 if(iosock.emit('sendTrade', {message: data})) printMessage(data); 
        }
     });

    //LADDER TRADING SYSTEM    
    $('body').on('click', 'td', function(){
        if($('#oneclick').is(':checked')){
            if($(this).hasClass('price')){
        		console.log('cicked on price');
        		return false;
        	} else {
        		data = {}; 
        		var row = $(this).closest('tr');
        		data.price = row.data('price');
        		data.market = row.data('market');
        		data.contracts = $('#contracts').val();
       				
       				if($(this).hasClass('askcol')){
           	 			data.tradetype = "BUY";
       				} else {
            			data.tradetype = "SELL";
        			}
        	}
        	
        	if(data.contracts==""){
        		alert('Please enter a valid integer, for contracts');
        		return false;
        	}
         	if(iosock.emit('sendTrade', {message: data})) printMessage(data);
    	}
    });


    //CONSOLE MESSAGE FOR TRADES
    function printMessage(data){
     	console.log(data.tradetype+" "+data.contracts+" contracts @ "+data.price+" in the "+data.market+" market"); 
    }

});