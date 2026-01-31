import isType from "./typeHelpers";

export default function checkFormat(format,object){
    for (const [key,value] of Object.entries(format)) {
        if(!isType(object[key],value)&&!isType(object[key],"undefined"))return false    
    }
    return true
}