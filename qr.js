/* Tiny QR generator wrapper using qrcode-generator (MIT). */
/* Included minified core (short) adapted for offline use. */
(function(global){
  // qrcode-generator (reduced) by Kazuhiko Arase - MIT
  // Source: https://github.com/kazuhikoarase/qrcode-generator
  // This is a compact build sufficient for basic QR.
  function QR8bitByte(data){this.mode=1;this.data=data;this.parsed=[];for(var i=0;i<data.length;i++){this.parsed.push(data.charCodeAt(i));}}
  QR8bitByte.prototype={getLength:function(){return this.parsed.length;},write:function(buffer){for(var i=0;i<this.parsed.length;i++){buffer.put(this.parsed[i],8);}}};
  function QRBitBuffer(){this.buffer=[];this.length=0;}
  QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return ((this.buffer[bufIndex]>>> (7-index%8))&1)==1;},
    put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>> (length-i-1))&1)==1);}},
    putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}if(bit){this.buffer[bufIndex]|=(0x80>>> (this.length%8));}this.length++;}};
  function QRPolynomial(num,shift){if(num.length==undefined)throw new Error(num.length+"/"+shift);var offset=0;while(offset<num.length&&num[offset]==0){offset++;}this.num=[];for(var i=0;i<num.length-offset;i++){this.num.push(num[i+offset]);}for(i=0;i<shift;i++){this.num.push(0);}}
  QRPolynomial.prototype={get:function(i){return this.num[i];},getLength:function(){return this.num.length;},
    multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<num.length;i++)num[i]=0;
      for(i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
      return new QRPolynomial(num,0);},
    mod:function(e){if(this.getLength()-e.getLength()<0)return this;var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));
      var num=this.num.slice();for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
      return new QRPolynomial(num,0).mod(e);}};
  var QRMath={glog:function(n){if(n<1)throw new Error("glog");return QRMath.LOG_TABLE[n];},
    gexp:function(n){while(n<0)n+=255;while(n>=256)n-=255;return QRMath.EXP_TABLE[n];},
    EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};
  for(var i=0;i<8;i++)QRMath.EXP_TABLE[i]=1<<i;
  for(i=8;i<256;i++)QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];
  for(i=0;i<255;i++)QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;

  var QRRSBlock={getRSBlocks:function(typeNumber,errorCorrectLevel){
    // Only type 4 Q is used here for simplicity (enough for typical URLs)
    if(typeNumber!==4||errorCorrectLevel!==2){throw new Error("Only typeNumber=4 & EC=Q supported in this tiny build");}
    // RS blocks for type 4, Q: (2 blocks) total 100 codewords? simplified
    return [{totalCount:50,dataCount:24},{totalCount:50,dataCount:24}];
  }};
  var QRUtil={
    PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30]],
    G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),
    G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),
    G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),
    getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}return ((data<<10)|d)^QRUtil.G15_MASK;},
    getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}return (data<<12)|d;},
    getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}return digit;},
    getMask:function(maskPattern,i,j){
      switch(maskPattern){case 0:return (i+j)%2==0;case 1:return i%2==0;case 2:return j%3==0;case 3:return (i+j)%3==0;
        case 4:return (Math.floor(i/2)+Math.floor(j/3))%2==0;case 5:return (i*j)%2+(i*j)%3==0;case 6:return ((i*j)%2+(i*j)%3)%2==0;
        case 7:return ((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad mask");}},
    getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}return a;}
  };

  function QRCodeModel(typeNumber,errorCorrectLevel){
    this.typeNumber=typeNumber;this.errorCorrectLevel=errorCorrectLevel;
    this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[];
  }
  QRCodeModel.prototype={
    addData:function(data){this.dataList.push(new QR8bitByte(data));this.dataCache=null;},
    isDark:function(row,col){if(this.modules[row][col]!=null){return this.modules[row][col];}return false;},
    getModuleCount:function(){return this.moduleCount;},
    make:function(){this.makeImpl(false,this.getBestMaskPattern());},
    makeImpl:function(test,maskPattern){
      this.moduleCount=this.typeNumber*4+17;
      this.modules=new Array(this.moduleCount);
      for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++)this.modules[row][col]=null;}
      this.setupPositionProbePattern(0,0);
      this.setupPositionProbePattern(this.moduleCount-7,0);
      this.setupPositionProbePattern(0,this.moduleCount-7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test,maskPattern);
      if(this.typeNumber>=2){this.setupTypeNumber(test);}
      if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
      this.mapData(this.dataCache,maskPattern);
    },
    setupPositionProbePattern:function(row,col){
      for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;
        for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;
          if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){
            this.modules[row+r][col+c]=true;
          }else{this.modules[row+r][col+c]=false;}
        }}
    },
    setupTimingPattern:function(){
      for(var i=8;i<this.moduleCount-8;i++){
        if(this.modules[i][6]!=null)continue;this.modules[i][6]=i%2==0;
        if(this.modules[6][i]!=null)continue;this.modules[6][i]=i%2==0;
      }
    },
    setupPositionAdjustPattern:function(){
      var pos=QRUtil.PATTERN_POSITION_TABLE[this.typeNumber];
      for(var i=0;i<pos.length;i++){
        for(var j=0;j<pos.length;j++){
          var row=pos[i],col=pos[j];
          if(this.modules[row][col]!=null)continue;
          for(var r=-2;r<=2;r++){
            for(var c=-2;c<=2;c++){
              this.modules[row+r][col+c]=(Math.max(Math.abs(r),Math.abs(c))!=1);
            }
          }
        }
      }
    },
    setupTypeNumber:function(test){
      var bits=QRUtil.getBCHTypeNumber(this.typeNumber);
      for(var i=0;i<18;i++){
        var mod=!test&&((bits>>i)&1)==1;
        this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;
      }
      for(i=0;i<18;i++){
        mod=!test&&((bits>>i)&1)==1;
        this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;
      }
    },
    setupTypeInfo:function(test,maskPattern){
      var data=(this.errorCorrectLevel<<3)|maskPattern;
      var bits=QRUtil.getBCHTypeInfo(data);
      for(var i=0;i<15;i++){
        var mod=!test&&((bits>>i)&1)==1;
        if(i<6){this.modules[i][8]=mod;}
        else if(i<8){this.modules[i+1][8]=mod;}
        else{this.modules[this.moduleCount-15+i][8]=mod;}
      }
      for(i=0;i<15;i++){
        mod=!test&&((bits>>i)&1)==1;
        if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}
        else if(i<9){this.modules[8][15-i-1+1]=mod;}
        else{this.modules[8][15-i-1]=mod;}
      }
      this.modules[this.moduleCount-8][8]=!test;
    },
    mapData:function(data,maskPattern){
      var inc=-1,row=this.moduleCount-1,bitIndex=7,byteIndex=0;
      for(var col=this.moduleCount-1;col>0;col-=2){
        if(col==6)col--;
        while(true){
          for(var c=0;c<2;c++){
            if(this.modules[row][col-c]==null){
              var dark=false;
              if(byteIndex<data.length){dark=((data[byteIndex]>>>bitIndex)&1)==1;}
              var mask=QRUtil.getMask(maskPattern,row,col-c);
              if(mask)dark=!dark;
              this.modules[row][col-c]=dark;
              bitIndex--;
              if(bitIndex==-1){byteIndex++;bitIndex=7;}
            }
          }
          row+=inc;
          if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}
        }
      }
    },
    getBestMaskPattern:function(){
      // just choose 0 for simplicity
      return 0;
    }
  };
  QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;
  QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){
    var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);
    var buffer=new QRBitBuffer();
    for(var i=0;i<dataList.length;i++){
      var data=dataList[i];
      buffer.put(4,4); // mode 8bit
      buffer.put(data.getLength(),8);
      data.write(buffer);
    }
    var totalDataCount=0;
    for(i=0;i<rsBlocks.length;i++)totalDataCount+=rsBlocks[i].dataCount;
    if(buffer.length+4<=totalDataCount*8)buffer.put(0,4);
    while(buffer.length%8!=0)buffer.putBit(false);
    while(true){
      if(buffer.length>=totalDataCount*8)break;
      buffer.put(QRCodeModel.PAD0,8);
      if(buffer.length>=totalDataCount*8)break;
      buffer.put(QRCodeModel.PAD1,8);
    }
    return QRCodeModel.createBytes(buffer,rsBlocks);
  };
  QRCodeModel.createBytes=function(buffer,rsBlocks){
    var offset=0, maxDcCount=0, maxEcCount=0;
    var dcdata=new Array(rsBlocks.length);
    var ecdata=new Array(rsBlocks.length);
    for(var r=0;r<rsBlocks.length;r++){
      var dcCount=rsBlocks[r].dataCount;
      var ecCount=rsBlocks[r].totalCount-dcCount;
      maxDcCount=Math.max(maxDcCount,dcCount);
      maxEcCount=Math.max(maxEcCount,ecCount);
      dcdata[r]=new Array(dcCount);
      for(var i=0;i<dcdata[r].length;i++)dcdata[r][i]=0xff & buffer.buffer[i+offset];
      offset+=dcCount;
      var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);
      var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);
      var modPoly=rawPoly.mod(rsPoly);
      ecdata[r]=new Array(rsPoly.getLength()-1);
      for(i=0;i<ecdata[r].length;i++){
        var modIndex=i+modPoly.getLength()-ecdata[r].length;
        ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;
      }
    }
    var totalCodeCount=0;
    for(r=0;r<rsBlocks.length;r++)totalCodeCount+=rsBlocks[r].totalCount;
    var data=new Array(totalCodeCount);
    var index=0;
    for(i=0;i<maxDcCount;i++){
      for(r=0;r<rsBlocks.length;r++){
        if(i<dcdata[r].length)data[index++]=dcdata[r][i];
      }
    }
    for(i=0;i<maxEcCount;i++){
      for(r=0;r<rsBlocks.length;r++){
        if(i<ecdata[r].length)data[index++]=ecdata[r][i];
      }
    }
    return data;
  };

  function drawQR(canvas,text){
    var qr=new QRCodeModel(4,2); // type 4, Q
    qr.addData(text);
    qr.make();
    var ctx=canvas.getContext("2d");
    var count=qr.getModuleCount();
    var size=Math.min(canvas.width,canvas.height);
    var tile=Math.floor(size/count);
    var margin=Math.floor((size - tile*count)/2);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="rgba(255,255,255,0.92)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="rgba(0,0,0,0.92)";
    for(var r=0;r<count;r++){
      for(var c=0;c<count;c++){
        if(qr.isDark(r,c)){
          ctx.fillRect(margin + c*tile, margin + r*tile, tile, tile);
        }
      }
    }
  }

  global.QR = { draw: drawQR };
})(window);
