const xlsx=require("node-xlsx");


class Export{
    constructor(){

    }

    /**
     * @param {Array} titles excel tablosunun başlıkları
     * @param {*}columns excel tablosuna yazılacak verilerin isimleri [id,category_name,is_active]
     * @param {*} data excel tablosuna yazılan veriler
     * */
    toExcel(titles,columns,data=[]){

        let rows=[];

        /*
        [
             ["ID","CATEGORY_NAME","IS ACTIVE"],
             ["data","data","data"]
        ]
        */
        row.push(titles);


        for(let i=0;i<data.length;i++){
            let item=data[i];
            let cols=[];

            for(let j=0;j<columns.length;j++){
                cols.push(item[columns[j]]);
            }

            rows.push(cols);
        }

        return xlsx.build([{name:"Sheet",data:rows}]);
    }
};
module.exports=Export;