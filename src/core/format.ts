export function leadingZeros( value: number, length: number ): string {
  const v = [ value.toString() ];
  let l = v[0].length;

  while (l < length) {
    v.push( '0' );
    l++;
  }

  return v.reverse().join( '' );
}

/*
export function twoDigits( value: number ): string {
  return value < 10 ? `0${value}` : value.toString();
}

export function treeDigits( value: number ): string {
  if (value < 10) {
    return `00${value}`;
  }
  else if (value < 100) {
    return `0${value}`;
  }
  else {
    return value.toString();
  }
}
*/

export function msToTime( duration: number, precision: number = 3 ): string {
  precision = Math.max( 0, Math.min( 3, precision ) );

  if (duration === 0) {
    if (precision === 0) {
      return '00:00';
    }
    else {
      return `00:00.${leadingZeros( 0, precision )}`;
    }
  }

  const ms = duration % 1000;
  let time = Math.floor( duration / 1000 );

  const comps = [];
  for (let i = 0; i < 3 && (comps.length < 2 || time); i++) {
    comps.push( time % 60 );
    time = Math.floor( time / 60 );
  }

  let result = comps.reverse().map( c => leadingZeros( c, 2 ) ).join( ':' );
  if (precision) {
    result += '.' + leadingZeros( ms, precision );
  }

  return result;
}

export function secToTime( duration: number ): string {
  let time = Math.round( duration );
  if (duration === 0) {
    return '00:00';
  }

  const comps = [];
  for (let i = 0; i < 3 && (comps.length < 2 || time); i++) {
    comps.push( time % 60 );
    time = Math.floor( time / 60 );
  }

  return comps.reverse().map( c => leadingZeros( c, 2 ) ).join( ':' );
}

export function toDate( value: string | Date ) {
  const d = typeof value === 'string' ? new Date( value ) : value;

  const yyyymmdd = [
    leadingZeros( d.getDate(), 2 ),
    leadingZeros( d.getMonth() + 1, 2 ),
    d.getFullYear(),
  ];

  const hhmmss = [
    leadingZeros( d.getHours(), 2 ),
    leadingZeros( d.getMinutes(), 2 ),
    leadingZeros( d.getSeconds(), 2 ),
  ];

  return `${yyyymmdd.join('.')} ${hhmmss.join(':')}`;
}

export function s( num: number ) {
  return num > 1 ? 's' : '';
}
