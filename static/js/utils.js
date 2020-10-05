function fractureSum(a, b){
  function totalLower(a1,b1){
    function primes(x){
      let result = [];
      let n = 2;
      while(x>1){
        if(x % n === 0){
          result.push(n);
          x /= n;
        }else{
          n += 1;
        }
      }
      return result;
    }
    let diff = primes(a1).filter(c => !primes(b1).includes(c))
    return diff.reduce((cur, acc) => acc *= cur, b1);
  }
  let lower = totalLower(a[1], b[1]);
  let upperA = a[0] * lower / a[1];
  let upperB = b[0] * lower / b[1];
  let upper = upperA + upperB;
  let result = a;
  if (upper > 0){
    while(upper % 1 !== 0){
      upper *= 2;
      lower *= 2;
    }
    let n = 2;
    while (n <= Math.max(upper, lower)){
      if(upper % n === 0 && lower % n === 0){
        upper /= n;
        lower /= n;
      } else {
        n += 1;
      }
    }
    result = [upper, lower];
  }
  return result;
}

export {fractureSum};
