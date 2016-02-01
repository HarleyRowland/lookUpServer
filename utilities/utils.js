module.exports = {
  generateCode: function(codeLength) {
    if(isNaN(codeLength)) codeLength = 6;
    var code = ""
    for (var i = 0; i < codeLength; i++) {
      code = code + randomNumber();
    };
    return code;
  },

};

var randomNumber = function(){
  return randomnumber=Math.floor(Math.random()*10);
}