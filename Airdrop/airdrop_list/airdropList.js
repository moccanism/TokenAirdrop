/**
 * Created by zhaoyiyu on 2018/2/5.
 */

const totalAirdropListPath = './airdrop_list/itc_airdrop_total.xlsx';
const awardsAirdropListPath = './airdrop_list/awards.xlsx';
const errorAirdropListPath = './airdrop_list/errorAddress.xlsx';

//address 在excel中的序号
const addressIndex = 3;

function readFile(path){

    var xlsx = require('node-xlsx');
    var fs = require('fs');

    //parse
    var obj = xlsx.parse(path);
    var excelObj=obj[0].data;
    //console.log(excelObj);

    var data = [];
    for(var i in excelObj){
        var arr=[];
        var value=excelObj[i];
        for(var j in value){
            arr.push(value[j]);
        }
        data.push(arr);
    }

    return data;
}

var getRepeatAccount = function (dataArr) {

    var airdropList = [];
    var repeatAirdropAddressIndexs = [];

    for (var i in dataArr){

        var arr = data[i];
        var obj = arr[addressIndex];

        if (airdropList.indexOf(obj) == -1){

          airdropList.push(obj);
        }
        else {
           // console.log(obj);
            repeatAirdropAddressIndexs.push(i);
        }
    }

    return repeatAirdropAddressIndexs;
};


var parseTotalAirdropList = function (result){

    //read xlsx data
    data = readFile(totalAirdropListPath);

    //repeat address index
    var repeatAirdropAddressIndexs = getRepeatAccount(data);

    console.log('repeatAirdropAddressIndexs：\n'+repeatAirdropAddressIndexs);

    // console.log(data);
    var airdropList = [];
    var invalidAirdropList = [];
    var repeatList = [];

    //start index
    var destinationStartIndex = 0;
    //max amount
    const  maxLength = 50;

    for (var i in data){

        if(i == 0){
            continue;
        }

        if(i < destinationStartIndex){
            continue;
        }

        if(i == destinationStartIndex + maxLength){
            break;
        }

        //repeat token Address
        if(repeatAirdropAddressIndexs.indexOf(i) != -1){

            var arr = data[i];
            repeatList.push(arr);
            continue;
        }

        var arr = data[i];
        var obj = arr[addressIndex];

        if(obj.length == 42){
            airdropList.push(obj);
        }
        else {
            var invalidObj = {} ;
            invalidObj.name = arr[1];
            invalidObj.address = obj;

            invalidAirdropList.push(invalidObj);
        }
    }

    console.log('airdropListAccount:'+airdropList.length);
    console.log('repeatAccount:'+repeatList.length);
    console.log('invalidListAccount:'+invalidAirdropList.length);

    result(airdropList);
};




var parseAwardsAirdropList = function (result){

    var data = readFile(awardsAirdropListPath);

    var addresses = [];
    var amounts = [];

    //start index
    var destinationStartIndex = 0;
    //max amount
    const  maxLength = 50;

    for (var i in data){

        if(i == 0){
            continue;
        }

        if(i < destinationStartIndex){
            continue;
        }

        if(i == destinationStartIndex + maxLength){
            break;
        }

        var arr = data[i];

        addresses.push(arr[1]);
        amounts.push(arr[2]);
    }

    result(addresses,amounts);
};


function createRandomAward(){

    //read xlsx data
    var data = readFile(totalAirdropListPath);

    var airdropList = [];
    var nameList = [];

    var totolaName = [];

    for (var i in data){

        var arr = data[i];
        var obj = arr[addressIndex];
        if (airdropList.indexOf(obj) == -1 && obj.length == 42) {

            airdropList.push(obj);
            nameList.push(arr[1]);
        }

        totolaName.push(arr[1]);
    }

    var amountsArr = [];
    var accountsArr = [];

    //recoderArr
    var writeFileContent = [['Name','Rwards','Amount','sequence','Token Address']];

    //account of awards
    for (var i = 0; i < 500 + 20 + 1 ; i ++) {

        if (airdropList.length == i) {

            break;
        }

        var content = [];

        while (1){
            var j = GetRandomNum(0, airdropList.length - 1);
            //console.log('random' + j);

            var obj = airdropList[j];

            if (accountsArr.indexOf(obj) == -1) {

                var name = nameList[j];
                content.push(name);

                var amount = '4';
                var awardName = 'Third prize';
                if (i == 0) {
                    amount = '499';
                    awardName = 'First prize';
                }
                else if (i < 21) {
                    amount = '49';
                    awardName = 'Second prize';
                }

                amountsArr.push(amount);
                content.push(awardName);
                content.push(amount);

                var index = totolaName.indexOf(name);

                content.push(index);

                accountsArr.push(obj);
                content.push(obj);
                break;
            }
        }


        writeFileContent.push(content);
    }

    //recoder
    writeData(writeFileContent,awardsAirdropListPath);
};

function getErrorAddressList() {
    var data = readFile(totalAirdropListPath);

    var writeFileContent = [];

    for (var i in data){

        var arr = data[i];
        var obj = arr[addressIndex];
        if (obj.length != 42 && writeFileContent.indexOf(arr) == -1) {
            writeFileContent.push(arr);
        }
    }

    writeData(writeFileContent,errorAirdropListPath)

}

function GetRandomNum(Min,Max)
{
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

function writeData(data,path) {

    var xlsx = require('node-xlsx');
    var fs = require('fs');

    var buffer = xlsx.build([
        {
            name:'sheet1',
            data:data
        }
    ]);

    fs.writeFileSync(path,buffer,{'flag':'w'});
}


// exports function

var normalAirdrop = function (result) {

    parseTotalAirdropList(result);
};

var awardsAirdrop = function(result){

    var fs = require('fs');

    fs.exists(awardsAirdropListPath,function (didExists) {

        console.log(didExists);
        if (didExists == false){

            createRandomAward();
            console.log('Generated reward list has been generated！');
        }

        console.log('Start sending reward airdrop');

        parseAwardsAirdropList(result);
    });
};

module.exports = {
    normalAirdrop:normalAirdrop,
    awardAridropList:awardsAirdrop,
    getErrorList:getErrorAddressList

};