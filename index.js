function MyPromise(executor){
  this.status = "pending"
  this.value = null
  this.reason = null
  this.onFulfilledArray = []
  this.onRejectedArray = []

  const resolve = (value) => { //使用箭头函数来保证this执行的准确性
    if(value instanceof MyPromise){
      return value.then(resolve,reject)
    }
    /**
     * 使用setTimeout 将resolve 和 reject函数要执行的逻辑放到任务队列中，不会阻塞同步任务
     * 使用setTimeout并不严谨，为了保证Promise属于microtasks 很多Promise的实现库使用 MutationObserver来模仿nextTick
     */
    setTimeout(()=>{
      if(this.status == "pending"){
        this.value = value
        this.status = 'fulfilled'
        this.onFulfilledArray.forEach(func=>{
          func(value)
        })
      }
    })
  }

  const reject =  (reason) => {
    setTimeout(()=>{
      if(this.status == "pending"){
        this.reason = reason
        this.status = "rejected"
        // this.onrejectedFunc(this.reason)
        this.onRejectedArray.forEach(func => {
          func(reason)
        })
      }
    })
  }
  try{
    executor(resolve,reject)
  } catch(e){
    reject(e)
  }
}

MyPromise.prototype.then = function (onfulfilled, onrejected){
  onfulfilled = typeof onfulfilled == "function" ? onfulfilled : data => data
  onrejected = typeof onrejected == "function" ? onrejected : error => {throw error}
  if(this.status == "fulfilled"){
    onfulfilled(this.value)
  }
  if(this.status == "rejected"){
    onrejected(this.reason)
  }
  if(this.status == "pending"){
    this.onFulfilledArray.push(onfulfilled)  
    this.onRejectedArray.push(onrejected)
  }
}