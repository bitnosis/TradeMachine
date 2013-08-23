$(document).ready(function() {
            
            bids = [];
            asks = [];
            
            $('tr').each(function(){
            	if($(this).hasClass('askrow')){
            	asks.push({"price":$(this).data('price'),"vol":$(this).data('vol')});}
            	else if($(this).hasClass('bidrow')){
            	bids.push({"price":$(this).data('price'),"vol":$(this).data('vol')});
            	}	
            });

           	lastval = $('h2.lastprice').html();
            
 
            var ws = new WebSocket('wss://websocket.mtgox.com/mtgox');
            var bc = new WebSocket('ws://ws.blockchain.info/inv');

            bc.onopen = function(e){
            	console.log("Blockchain Connection established");
            	doSend({"op":"unconfirmed_sub"});
            }

          
            function doSend(msg){
	           	bc.send(JSON.stringify(msg));
	           	console.log("SENT: " + msg); 
            }


            bc.onmessage = function(e){
            	
            	var x = JSON.parse(e.data);
            	            	
            	var IP =  x.x.relayed_by;
            	var time =  x.x.time;
            	var BTC = parseFloat(x.x.inputs[0].prev_out.value*0.00000001).toFixed(3);
            	var addr = x.x.inputs[0].prev_out.addr;
            	var hash = x.x.hash;
            	hash = hash.substring(0,15)+"...";

            	var us = parseFloat(BTC*lastval).toFixed(2);
            	var data = "<tr class='tran'><td><span class='label label-inverse'>"+hash+"</span></td><td><button class='btn btn-small btn-primary'>"+BTC+" BTC</button></td><td><button class='btn btn-small btn-success'>$"+us+"</button></td></tr>";
            	$(data).prependTo(".transactions").effect("highlight", {}, 2200);

            	if($('.tran').length>9){
            		$('.transactions tr:last').remove();
            	}
            	
            }
			
			ws.onmessage = function(e){ 
			var d = JSON.parse(e.data);
			
			if(d.channel_name=="trade.BTC"){
				if(d.trade.price_currency=="USD"){
				var x = d.trade;
				var theclass="";
				if(x.trade_type=="ask"){
					theclass="ask";
					$('h2.lastprice').html(parseFloat(x.price).toFixed(3)).css('color', 'green');
				} else {
					theclass="bid";
					$('h2.lastprice').html(parseFloat(x.price).toFixed(3)).css('color', 'red');
				}
				
				var data = "<tr class='trade "+theclass+"'><td><span class='label label-inverse'>"+x.tid+"</span></td><td>"+parseFloat(x.amount).toFixed(3)+"</td><td><span class='label label-inverse'>"+parseFloat(x.price).toFixed(3)+" BTC</span></td><td><span class='label label-success'>$"+parseFloat(x.amount*x.price).toFixed(3)+"</span></td></tr>";
            	$(data).prependTo(".trades").effect("highlight", {}, 2200);
				}
				
			} else if(d.channel_name=="depth.BTCUSD"){
				if(d.depth.type_str=="ask"){
					
					var N = asks.length;
					for(var j=1; j<N; j++){
						if((d.depth.price>asks[j].price)&&(d.depth.price<asks[j-1].price)){
							data = {"price":d.depth.price, "vol":d.depth.volume};
							asks.splice(j, 0, data);
						}
					}

					asks.sort(function(a, b) { return b.price - a.price });
					asks.splice(6,6);
					
					var html="";
					$.each(asks, function(){
					html += "<tr><td class='nodata'></td><td class='nodata'></td><td class='ask price'>$"+parseFloat(this.price).toFixed(3)+"</td><td class='ask'>"+parseFloat(this.vol).toFixed(3)+"</td></tr>";
					});
					$('.allasks').html(html);
									
				} else if(d.depth.type_str=="bid"){ 
					var N = bids.length;

					for(var j=1; j<N; j++){
						
						if((d.depth.price>bids[j].price)&&(d.depth.price<bids[j-1].price)){
							data = {"price":d.depth.price, "vol":d.depth.volume};
							bids.splice(j, 0, data);
						}
						
					}
					
					bids.sort(function(a, b) { return b.price - a.price });
					bids.splice(6,6);
					
					var html2 ="";
					$.each(bids, function(){
					html2 += "<tr><td class='bid'>"+parseFloat(this.vol).toFixed(3)+"</td><td class=' bid price'>$"+parseFloat(this.price).toFixed(3)+"</td><td class='nodata'></td><td class='nodata'></td></tr>";
					});
					$('.allbids').html(html2);

				};
			};
		};




        });