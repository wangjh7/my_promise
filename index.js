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
  //promise2将作为then方法的返回值
  let promise2

  if(this.status == "fulfilled"){
    return promise2 = new MyPromise((resolve,reject)=>{
      setTimeout(()=>{
        try{
          //promise2的 被resovle函数处理的值为 onfulfilled的执行结果
          let result = onfulfilled(this.value)
          resolve(result)
        } catch(e){
          reject(e)
        }
      })
    })
  }
  if(this.status == "rejected"){
    return promise2 = new MyPromise((resolve,reject)=>{
      setTimeout(()=>{
        try{
          //promise2的 被resolve函数处理的值为 onrejected的执行结果
          let result = onrejected(this.reason)
          resolve(result)
        } catch(e){
          reject(e)
        }
      })
    })
  }
  if(this.status == "pending"){
    return promise2 = new MyPromise((resolve,reject)=>{
      this.onFulfilledArray.push(()=>{
        try{
          let result = onfulfilled(this.value)
          resolve(result)
        } catch(e){
          reject(e)
        }
      })
      this.onRejectedArray.push(()=>{
        try{
          let result = onrejected(this.reason)
          resolve(result)
        } catch(e){
          reject(e)
        }
      })
    })
  }
}