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
        msgReceived(msg);
    });
   

    iosock.on('message', function(msg){
        
   
        var buys = msg.buys.volumes;
        var sells = msg.sells.volumes;
        var html = "";
        var max = maxKey(sells);
        var min = minKey(buys);
        var length = max-min;
        var prices = [];
        var val="";

        buildHTML(msg.market);

        function buildHTML(market){
            if(msg.market==market){

                for(var i=0; i<length; i++){
                    prices.push(max-i);
                    val = max-i;
                }
        
            prices.push(val-1);

        $.each(prices, function(key, val){
                if(val in buys){
                     html += "<tr><td class='price bids'>"+buys[val]+"</td><td class='price'>"+val+"</td><td></td></tr>";
                } 
                else if(val in sells){
                 html += "<tr><td></td><td class='price'>"+val+"</td><td class='price asks'>"+sells[val]+"</td></tr>";
                } 
                else {
                 html += "<tr><td class='empty'></td><td class='price'>"+val+"</td><td class='empty'></td></tr>";
                }
            });
            }
             $("."+market).html(html);
        }
       

        
        

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
});