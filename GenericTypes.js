function GenericItem(id, name, status) {
    this.id = id;
    this.name = name;
    this.status = status;
    
    this.total = function(){ return 1; };
  }

  function GenericType(id, name, data, status) {
    this.id = id;
    this.name = name;
    this.data = (data === undefined)? []: data;
    
    this.total = function(){
      var l = this.data.length;
      var count = 0;
      for(var i = 0; i < l; i++){
        count += this.data[i].total();
      }
      return count;
    };   
  }

  function GenericTypeList(name) {
    this.name = name;
    this.types = [];

    this.findTypeByName = function(name) {
      return this.types.map(function(type) { return type.name;}).indexOf(name);
    }

    this.findTypeById = function(id) {
      return this.types.map(function(type) { return type.id;}).indexOf(id);
    } 

    this.getTypeByName = function(name) {
      var index = this.findTypeByName(name);      
      if(index === -1){
        return index;
      }
      return this.types[index];
    }

    this.getTypeById = function(id) {
      var index = this.findTypeById(id);      
      if(index === -1){
        return index;
      }
      return this.types[index];
    }

    this.addTypeData = function(name, data){
      if(this.findTypeByName(name) === -1){
        generateType(this, name);
      }

      return addData(this, name,data);
    }

    this.total = function(){
      var l = this.types.length;
      var count = 0;
      for(var i = 0; i < l; i++){
        count += this.types[i].total();
      }
      return count;
    }  

    // this.generateType = function (name) {
    function generateType(self, name) {
      var typeIdList = self.types.map(function(o) { return o.id; })
      var newType = new GenericType(getUniqueId(1,100, typeIdList), name, [] );
      self.types.push(newType);
    }      

    // this.addData = function(name, data){
    function addData(self, name, data){
      var typeIndex = self.findTypeByName(name);
      if(typeIndex === -1){
        return false;
      }
      self.types[typeIndex].data.push(data);
      return true;
    }
  }