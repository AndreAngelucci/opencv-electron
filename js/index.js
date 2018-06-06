var imagemOrigem = document.getElementById('imOriginal')
var selectFiltro = document.getElementById('selecaoFiltro')
var imagemDestino = document.getElementById('imDestino')

const cv = require('opencv4nodejs')

document.querySelector('input').addEventListener(
  'change', (e) => {
    //nova imagem
    imagemOrigem.src = e.target.files[0].path      
  }
)

function defineImagemDestino(path){
  imagemDestino.src = path
}

function atualizaFiltro(){
  origem = imagemOrigem.getAttribute('src')
  const mat = cv.imread(origem);
  sf = selectFiltro.value
  switch (sf){
    case '1':
      defineImagemDestino(fPBNLinear(mat))
      break
    case '2':
      defineImagemDestino(fGaussianBlur(mat))
      break
    case '3':
      defineImagemDestino(fPassaAltas(mat))
      break
    case '4':
      defineImagemDestino(fSobel(mat))
      break
    case '5':
      defineImagemDestino(histograma(mat))
      break
    case '6':
      defineImagemDestino(fContrateNoroeste(mat))
      break
    case '7':
      defineImagemDestino(fContrateSudoeste(mat))
      break
    default:
      defineImagemDestino('./nenhuma-imagem.png')  
  }
}

//no evento on load, ainda nao esta com a nova imagem
imagemOrigem.onload = function() {
  atualizaFiltro()
};

selectFiltro.onchange = function() {
  atualizaFiltro()
}

function histograma(mat){
  // single axis for 1D hist
  const getHistAxis = channel => ([
    {
      channel,
      bins: 256,
      ranges: [0, 256]
    }
  ]);

  // calc histogram for blue, green, red channel
  const bHist = cv.calcHist(mat, getHistAxis(0));
  const gHist = cv.calcHist(mat, getHistAxis(1));
  const rHist = cv.calcHist(mat, getHistAxis(2));

  const blue = new cv.Vec(255, 0, 0);
  const green = new cv.Vec(0, 255, 0);
  const red = new cv.Vec(0, 0, 255);

  // plot channel histograms
  const plot = new cv.Mat(300, 600, cv.CV_8UC3, [255, 255, 255]);
  cv.plot1DHist(bHist, plot, blue, { thickness: 2 });
  cv.plot1DHist(gHist, plot, green, { thickness: 2 });
  cv.plot1DHist(rHist, plot, red, { thickness: 2 });

  cv.imwrite('histogram.png', plot)
  return 'histogram.png'
}

function fSobel(mat, ext){
  //filtro de sobel
  const s = mat.sobel(cv.CV_64F, 1, 0)
  dest = 'sobel.png'
  cv.imwrite(dest, s)
  return dest
}

function fPBNLinear(mat){
  const nl = mat.blur(new cv.Size(10, 10))  
  dest = 'nl.png'
  cv.imwrite(dest, nl)
  return dest
}

function fGaussianBlur(mat){
  const g = mat.gaussianBlur(new cv.Size(5, 5), 1.2, 0.8, cv.BORDER_REFLECT);
  dest = 'g.png'
  cv.imwrite(dest, g)
  return dest
}

function fPassaAltas(mat){  
  const d = cvfiltro2d(
    [
      [-1, -1, -1, -1, -1],
      [-1,  1,  1,  1, -1],
      [-1,  1,  8,  1, -1],
      [-1,  1,  1,  1, -1],
      [-1, -1, -1, -1, -1]      
    ], mat
  )
  dest = 'pa.png'
  cv.imwrite(dest, d)
  return dest
}

function fContrateNoroeste(mat){
  const d = cvfiltro2d(
    [
      [01, 01, 01],
      [01, -1, -1],
      [01, -1, -1]
    ], mat
  )
  dest = 'contrateN.png'
  cv.imwrite(dest, d)
  return dest
}

function fContrateSudoeste(mat){
  const d = cvfiltro2d(
    [
      [01, -1, -1],
      [01, -1, -1],
      [01, 01, 01]
    ], mat
  )
  dest = 'contrateS.png'
  cv.imwrite(dest, d)
  return dest
}

function cvfiltro2d(arr, mat){
  //filtro 2d com base no array
  const kernel = new cv.Mat(arr, 1)
  return mat.filter2D(cv.CV_8U, kernel)
}