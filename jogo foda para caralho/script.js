// ================= Variáveis Globais =================
let refinados = 0;
let isOpening = false;
let mochilaItens = [];
let currentItem = null;

// ================= Referências aos Elementos do DOM =================
const refinadoAmount = document.getElementById('refinadoAmount');
const video = document.getElementById('boxVideo');
const itemImg = document.getElementById('itemImg');
const itemName = document.getElementById('itemName');
const sellBtn = document.getElementById('sellBtn');
const storeBtn = document.getElementById('storeBtn');
const discardBtn = document.getElementById('discardBtn');
const testBtn = document.getElementById('testBtn');
const openBtn = document.getElementById('openBtn');
const alertBox = document.getElementById('alertBox');
const mochila = document.getElementById('mochila');

const notificationSound = document.getElementById('notificationSound');
const openCrateSound = document.getElementById('openCrateSound');

const valveShop = document.getElementById('valveShop');
const buyValveBtn = document.getElementById('buyValve');
const buyOitaoBtn = document.getElementById('buyOitao');

// ================= Configuração de Itens =================
const items = [
  {name: "panela dourada", src: "golden_frying_pan.png", chance: 5, sell: 'mochila'},
  {name: "panela de bosta", src: "frying_pan.png", chance: 25, sell: 0},
  {name: "arma foda AIMBOTON", src: "arma.png", chance: 15, sell: 500},
  {name: "Pystol", src: "pystol.png", chance: 20, sell: 250},
  {name: "Aeyelander", src: "aeyelander.png", chance: 25, sell: 250},
  {name: "Heavimetralha", src: "heavimetralha.png", chance: 15, sell: 500}
];

// ================= Funções Principais =================

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.add('show');
  if (notificationSound) notificationSound.play();

  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 3000);
}

function atualizarMochila() {
  mochila.innerHTML = '';
  mochilaItens.forEach(item => {
    const imgElem = document.createElement('img');
    imgElem.src = item.src;
    imgElem.title = item.name;
    imgElem.width = 50;
    imgElem.height = 50;
    mochila.appendChild(imgElem);
  });

  const countGold = mochilaItens.filter(it => it.name === "panela dourada").length;
  if (valveShop) valveShop.style.display = countGold >= 3 ? 'flex' : 'none';
}

function getRandomItem() {
  const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
  const roll = Math.random() * totalChance;
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.chance;
    if (roll <= cumulative) return item;
  }
  return items[items.length - 1];
}

function playVideo(src, callback) {
  video.src = src;
  video.currentTime = 0;
  video.volume = 1;
  video.style.display = 'block';
  video.play();

  const onVideoEnded = () => {
    video.style.display = 'none';
    document.removeEventListener('keydown', skipVideo);
    video.removeEventListener('ended', onVideoEnded);
    if (callback) callback();
  };

  const skipVideo = (e) => {
    if (e.key.toLowerCase() === 'o') {
      video.pause();
      onVideoEnded();
    }
  };

  video.addEventListener('ended', onVideoEnded);
  document.addEventListener('keydown', skipVideo);
}

function playFullscreenTestVideo(src, durationInSeconds, callback) {
  const videoContainer = document.getElementById('videoContainer');
  video.src = src;
  video.currentTime = 0;
  video.volume = 1;
  video.style.display = 'block';

  if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
  
  video.play();
  let timeoutId = null;

  const onTestEnded = () => {
    clearTimeout(timeoutId);
    video.removeEventListener('ended', onTestEnded);
    document.removeEventListener('keydown', skipTest);
    video.pause();
    video.style.display = 'none';
    if (document.exitFullscreen) document.exitFullscreen();
    if (callback) callback();
  };

  const skipTest = (e) => {
    if (e.key.toLowerCase() === 'o') onTestEnded();
  };

  video.addEventListener('ended', onTestEnded);
  document.addEventListener('keydown', skipTest);
  timeoutId = setTimeout(onTestEnded, durationInSeconds * 1000);
}

function playValveEndingVideo(src) {
  const videoContainer = document.getElementById('videoContainer');
  video.src = src;
  video.currentTime = 0;
  video.muted = false;
  video.volume = 1.0;
  video.style.display = 'block';
  
  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
    }).catch(error => {
      showAlert("O navegador bloqueou o autoplay. Clique para iniciar.");
    });
  }

  const onEndingEnded = () => {
    video.removeEventListener('ended', onEndingEnded);
    window.close();
    
    setTimeout(() => {
      document.body.innerHTML = '<h1 style="color:white; text-align:center; padding-top: 50px;">Obrigado por jogar!</h1>';
      document.body.style.backgroundColor = 'black';
    }, 500);
  };
  
  video.addEventListener('ended', onEndingEnded);
}

function showReward(item) {
  currentItem = item;
  itemImg.src = item.src;
  itemImg.style.display = 'block';
  itemName.textContent = item.name;
  itemName.style.display = 'block';

  showAlert(`Você recebeu: ${item.name}!`);

  if (item.sell === 'mochila') {
    showAlert(`${item.name} adicionado à mochila!`);
    mochilaItens.push(currentItem);
    atualizarMochila();
    setTimeout(hideItemActions, 2500);
  } else if (item.sell === 0) {
    showAlert(`Você descartou ${item.name}.`);
    setTimeout(hideItemActions, 2500);
  } else {
    sellBtn.style.display = 'block';
  }
}

function hideItemActions() {
  sellBtn.style.display = 'none';
  storeBtn.style.display = 'none';
  discardBtn.style.display = 'none';
  itemImg.style.display = 'none';
  itemName.style.display = 'none';
  currentItem = null;
}

// ================= Event Listeners =================

openBtn.addEventListener('click', () => {
  if (isOpening) return;
  isOpening = true;
  hideItemActions();
  testBtn.style.display = 'none';
  if (openCrateSound) openCrateSound.play();
  playVideo('caixa.mp4', () => {
    const item = getRandomItem();
    showReward(item);
    isOpening = false;
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'k') {
    for (let i = 0; i < 3; i++) {
      mochilaItens.push(items.find(it => it.name === "panela dourada"));
    }
    atualizarMochila();
    showAlert("3 panelas douradas adicionadas (modo teste)!");
  }
});

buyOitaoBtn.addEventListener('click', () => {
  if (refinados >= 2000) {
    refinados -= 2000;
    refinadoAmount.textContent = refinados;
    showAlert("Você comprou OitãoFoda! Clique em Testar Arma.");
    testBtn.style.display = 'block';
    mochilaItens.push({ name: "OitãoFoda", src: "oitão.png", sell: 0 });
    atualizarMochila();
  } else {
    showAlert("Refinados insuficientes!");
  }
});

testBtn.addEventListener('click', () => {
  if (!mochilaItens.find(it => it.name === "OitãoFoda")) {
    showAlert("Você não possui o OitãoFoda para testar!");
    return;
  }
  playFullscreenTestVideo('testando.mp4', 60, () => {
    showAlert("Teste da arma concluído!");
  });
});

// EVENTO DE COMPRA DA VALVE CORRIGIDO
buyValveBtn.addEventListener('click', () => {
  const goldCount = mochilaItens.filter(it => it.name === "panela dourada").length;
  if (goldCount >= 3) {
    let removed = 0;
    mochilaItens = mochilaItens.filter(it => {
      if (it.name === "panela dourada" && removed < 3) {
        removed++;
        return false;
      }
      return true;
    });
    atualizarMochila();
    showAlert("Você comprou a Valve!");

    // **A CORREÇÃO ESTÁ AQUI**
    // Em vez de apagar tudo, apenas escondemos os elementos da interface
    document.querySelector('h1').style.display = 'none';
    openBtn.style.display = 'none';
    refinadoAmount.parentElement.style.display = 'none'; // Esconde o container dos refinados
    document.getElementById('shop').style.display = 'none';
    if(document.getElementById('mochilaContainer')) {
        document.getElementById('mochilaContainer').style.display = 'none';
    } else {
        mochila.style.display = 'none'; // Fallback se não houver container
    }

    // Chama a função de finalização, que agora encontrará o player de vídeo
    playValveEndingVideo('video.mp4');

  } else {
    showAlert("Você precisa de 3 panelas douradas!");
  }
});

sellBtn.onclick = () => {
  if (!currentItem) return;
  refinados += currentItem.sell;
  refinadoAmount.textContent = refinados;
  showAlert(`Você vendeu ${currentItem.name} por ${currentItem.sell} refinados!`);
  hideItemActions();
};

// ================= Inicialização =================
document.addEventListener('DOMContentLoaded', () => {
  refinadoAmount.textContent = refinados;
  atualizarMochila();
  video.style.display = 'none';
});