export class TestMeta {
  
  _id: string;
  participant: string;
  timestamp: Date;
  resultWord: string;

  constructor() {
    this._id = '';
    this.participant = ''; 
    this.timestamp = new Date();
    this.resultWord = '';
  }
}

export function getTests( cb: CallableFunction ) {
  fetch( 'http://localhost:3000/tests', {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
  })
  .then( res => {
    return res.json();
  })
  .then( (tests: TestMeta[]) => {
    cb( tests );
  });
}

export function load( name: string, cb: CallableFunction ) {
  fetch( `http://localhost:3000/test/${name}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'same-origin',
  })
  .then( res => {
    if (res.status === 200) {
      return res.json();
    }
    else {
      cb({message: 'not found'});
    }
  })
  .then( res => {
    cb( res );
  });
}