// 通貨ペア検索
function test(){alert($('body').html())}

var durations = ["30秒","1分","3分","5分", "10分", "15分", "1時間","23時間"];
var gameType = null;
var gameTypeCode = 0;
var category = null;
var categoryCode = 0;
var asset = null;
var amount = 0;
var updown = 0;
var balance = 0;
var retry_count = 0;
var def_amount = 0;

function dispatchWSCommands(action, data)
{

	getCurrentDatas();

	var ary_entry = [];
	if (data != null)
	{
		ary_entry = data.split(',');
	}

	if (action == "GAME")
	{
		setGameType(ary_entry[0]);
		if (asset != ary_entry[2])
		{
			console.log('現在選択されている通貨ではありません。現在選択中の通貨：' + asset);
			searchAsset(ary_entry);
		}

	}
	else if (action == "ASSET")
	{
		//getCurrentDatas();
		//console.log(request.data);
		//var target = request.data;
		searchAsset(ary_entry);
		// 全てに設定
		//setCategory(1);
		//setGameType(4);
	}
	else if (action == "ENTRY")
	{

		if (asset != ary_entry[2])
		{
			console.log('現在選択されている通貨ではありません。現在選択中の通貨：' + asset);
			searchAsset(ary_entry);

			if (ary_entry.length == 4)
			{
				return;
			}
			
		}

		// エントリ処理
		if (gameTypeCode != ary_entry[0])
		{
			console.log('現在選択されているゲームタイプではありません。現在選択中のタイプ：' + gameType);
			setGameType(ary_entry[0]);

			return;
		}

		// GameType == 1 => GMOエントリ操作連動 
		if (gameTypeCode == 1)
		{
			let carousel_items = $('.carousel_item.ChangingStrike');
			if (ary_entry.length == 6)
			{
				var bfind = false;
				var price = 0;
				$('.carousel_item.ChangingStrike').each(function(index, element) {
					let st_time = $(this).find('.instrument-panel-body .instrument-panel-closing.closing-at .time-digits').text();

					if (st_time == ary_entry[4])
					{
						$(this).click();
						bfind = true;
						price = $(this).find('.strike-value .strike').text();
					}
				});

				if (!bfind)
				{
					console.log('指定判定時刻の選択肢がありません。判定時刻：' + ary_entry[4]);
					price_sel = $('.carousel_item.ChangingStrike').find('.strike-value .strike');
					price = 0;
					$(price_sel).each(function(index, element) {
						price = $(this).text();
						console.log(price);
					});
					return;
				}

				// ターゲットプライス確認
				let target_price = ary_entry[5];
				console.log('target_price='+target_price);
				console.log('price now =' + price);
				// ターゲットプライスより高いとき
				if ((price < target_price && ary_entry[3]==2) 
					|| (price > target_price && ary_entry[3]==1))
				{
					// エントリーしない
					console.log('SKIP! 現在価格:' + price + ' ストライク価格:' + target_price + 'HL: '+ ary_entry[3]);
					return;
				}
			}
		}

		if (updown != ary_entry[3])
		{
			console.log('現在選択されているHigh Low ではありません。現在選択中：' + updown);
			setUpDown(ary_entry[3]);
		}

		if (amount != def_amount)
		{
			setAmount(def_amount);
			setUpDown(ary_entry[3]);
		}
		doEntry();


	}
	else if (action == "CATE")
	{
		if (asset != ary_entry[2])
		{
			// 
			console.log('現在選択されている通貨ではありません。現在選択中の通貨：' + asset);
			searchAsset(ary_entry);
		}

		setAmount();

	}

    return true;
}

function removeComma(number) {
	if (number === undefined)
	{
		return 0;
	}
    var removed = number.replace(/,/g, '');
    return parseInt(removed, 10);
}

async function searchAsset(ary_entry)
{
	if (ary_entry.length != 4)
	{
		return;
	}

	console.log(ary_entry);

	if (gameTypeCode != ary_entry[0])
	{
		setGameType(ary_entry[0]);
	}

	if (ary_entry[0] > 2)
	{
		// gameType =  Turbo OR Turbo スプレッドスプレッド

		setCategory(ary_entry[1]);
		await new Promise(resolve => setTimeout(resolve, 500));

		setAsset(ary_entry[2]);

		return;

	}
	// 検索ボックスを開く
	var target_asset = ary_entry[2];
	retry_count = 0;
	if (getAsset() != target_asset) {

		$('.asset-filter--opener').click();
		await new Promise(resolve => setTimeout(resolve, 500));
		$('#searchBox').val(target_asset);
		await new Promise(resolve => setTimeout(resolve, 500));
		if (!$('#resetSearch').hasClass('clearCriteria'))
		{
			$('#resetSearch').click();
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		$('#assetsFilteredList .asset_item').click();

		retry_count++;
		if (retry_count > 1)
		{
			console.log('searchAsset failed');
			retry_count = 0;
			return;
		}

		searchAsset(target_asset);
	}

	// CATE
	setCategory(ary_entry[1]);

	if (ary_entry[3] > 0 && ary_entry[3] != updown)
	{
		setUpDown(ary_entry[3]);
	}
}

function setGameType(gameTypeCode)
{
	$('#assetsGameTypeZoneRegion .gameTab').each(function(index) {
		if (gameTypeCode == index+1)
		{
			$(this).click();

		}
	});
}

function setAsset(asset)
{
	$('#carousel_container .carousel_item #assetName').each(function(index) {
                var assetname = $(this).text();
                if (assetname == asset)
                {
			$(this).parent().parent().click();
                    setAmount();
                }
            });

}

// 通貨ペア検索
async function searchAsset(ary_entry)
{
	if (ary_entry.length != 4)
	{
		return;
	}

	console.log(ary_entry);

	if (gameTypeCode != ary_entry[0])
	{
		setGameType(ary_entry[0]);
	}

	if (ary_entry[0] > 2)
	{
		// gameType =  Turbo OR Turbo スプレッドスプレッド

		setCategory(ary_entry[1]);
		await new Promise(resolve => setTimeout(resolve, 500));

		setAsset(ary_entry[2]);

		return;

	}
	// 検索ボックスを開く
	var target_asset = ary_entry[2];
	retry_count = 0;
	if (getAsset() != target_asset) {

		$('.asset-filter--opener').click();
		await new Promise(resolve => setTimeout(resolve, 500));
		$('#searchBox').val(target_asset);
		await new Promise(resolve => setTimeout(resolve, 500));
		if (!$('#resetSearch').hasClass('clearCriteria'))
		{
			$('#resetSearch').click();
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		$('#assetsFilteredList .asset_item').click();

		retry_count++;
		if (retry_count > 1)
		{
			console.log('searchAsset failed');
			retry_count = 0;
			return;
		}

		searchAsset(target_asset);
	}

	// CATE
	setCategory(ary_entry[1]);

	if (ary_entry[3] > 0 && ary_entry[3] != updown)
	{
		setUpDown(ary_entry[3]);
	}
}

function setCategory(category)
{
	$('#assetsCategoryFilterZoneRegion .tab>span').each(function(index) {
		if (durations[category-1] == $(this).text())
		{
			$(this).parent().click();

			gameType = $("#gameTypeRegion .gameTab.selected").attr('data-game');
		}
	});
}

function setUpDown(updownCode)
{

	if (updownCode == 1)
	{
		$('#tradingZoneRegion #up_button').click();
		
	}
	else if (updownCode == 2)
	{
		$('#tradingZoneRegion #down_button').click();
	}

	updown = updownCode;

	setAmount();
	
}

function setAmount()
{

	//$('#trading_zone #amount').val(def_amount);
	setLots(def_amount);

}

function setLots( Lots ) {
    try {
        const KEY_LEFT = 37;
        const KEY_RIGHT = 39;
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        var amount = document.getElementById( 'amount' );
        amount.value = Lots;
        var _evt_down = document.createEvent( 'KeyboardEvent' );
        var _evt_press = document.createEvent( 'KeyboardEvent' );
        var _evt_up = document.createEvent( 'KeyboardEvent' );
        var _evt_input = document.createEvent( 'HTMLEvents' );
        _evt_down.initKeyboardEvent( 'keydown', true, true, null, false, false, false, false, KEY_LEFT, 0 );
        _evt_press.initKeyboardEvent( 'keypress', true, true, null, false, false, false, false, KEY_LEFT, 0 );
        _evt_up.initKeyboardEvent( 'keyup', true, true, null, false, false, false, false, KEY_LEFT, 0 );
        amount.dispatchEvent( _evt_down );
        amount.dispatchEvent( _evt_press );
        amount.dispatchEvent( _evt_up );
    } catch( e ) {
		console.log('Lots の入力時にエラーが発生しました. e=' + e.message);
    }
}

function doEntry()
{
	//fireAmountEvent();
	$('#tradeAreasRegion #trading_zone a#invest_now_button')[0].click();
	console.log('Entry!:' + gameType + ', ' + asset + ', ' + def_amount +', '+ String(updown));
}

function getAsset()
{
	asset_now = $('#changing_strike_trading_zone #asset').text();

	return asset_now;
}

function getCurrentDatas()
{
		// game
		gameType = $('#gameTypeRegion .gameTab.selected').attr('data-game');
		switch (gameType)
		{
			case 'ChangingStrike':
				gameTypeCode = 1;
				break;

			case 'FixedPayoutHL':
				gameTypeCode = 2;
				break;

			case 'ChangingStrikeOOD':
				gameTypeCode = 3;
				break;

			case 'FixedPayoutHLOOD':
				gameTypeCode = 4;
				break;
		}

		category = $('#categoryRegion .tab.selected > span').text();

		// selected asset
		asset = $('#changing_strike_trading_zone #asset').text();

		var str_balance = $('#account-balance #balance').text();
		str_balance = str_balance.slice(1);
		balance = removeComma(str_balance);

		amount = removeComma($('#amount').val());

		if ($('#tradingZoneRegion #up_button').hasClass('selected'))
		{
			updown = 1;
		}
		else if ($('#tradingZoneRegion #down_button').hasClass('selected'))
		{
			updown = 2;
		}
		else
		{
			updown = 0;
		}


		console.log('selected gameType:' + gameType);
		console.log('selected category:' + category);
		console.log('selected asset:' + asset);
		console.log('amount:' + amount);
		console.log('balance:' + balance);
	}

	function bindActions()
	{
		$('#invest_now_button').bind('click', function(){
			//alert('parent button');
			console.log('invest_now_button click!');
			send_message('entry');
		});

	// game select
	$('.gameTab').on('click', function(){
			console.log('invest_now_button click!');
			getCurrentDatas();
			//console.log(this);
		});

	$('.filtersArea .tab').on('click', function(){
			console.log('Category_tab click!');
			// $('.carousel_item').on('click', function(){
			// 	console.log('carousel_item click!');
			// 	getCurrentDatas();
			// });
			getCurrentDatas();
		});

	$('.carousel_item').on('click', function(){
			console.log('carousel_item click!');
			getCurrentDatas();
		});
	}
