async function messages(isSucess,codeNum,msg){
    return ("isSucess : " + isSucess +'\n' + "code : "+codeNum +'\n'+ "message : " + msg);
}


module.exports = {
    messages,
  };
  