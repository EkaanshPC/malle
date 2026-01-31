import isType from "./typeHelpers";

export default function getArrFromSpread(arr){
    if(Array.isArray(arr))return arr;
    if(Array.isArray(arr[0]))return arr;
    return false
}

export function areAllTypes(arr,type){
    for(let i=0;i<arr.length;i++){
        if(!isType(arr[i],type))return false
    }
    return true
}