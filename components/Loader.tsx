import React from 'react'

function Loader({className, size} : {
    className: string;
    size: 32 | 64 | 96 | 128
}) {
  if (size == 32) {
    return (
    <img src={'/coin_loader_32px.gif'} />
  )} else if (size == 64) {
    return (
      <img src={'/coin_loader_64px.gif'} />
    )
  } else if (size == 96) {
    return (
      <img src={'/coin_loader_96px.gif'} />
    )
  } else {
    return (
      <img src={'/coin_loader_128px.gif'} />
    )
  }
}

export default Loader