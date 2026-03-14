class TextBox {
  constructor(x, y, detectedWord) {
    this.x = x;
    this.y = y;
    this.word = detectedWord;
    this.size = this.word.length;
  }

  display() {
    noStroke();
    fill(0);
    textSize(16);
    rectMode(CENTER)
    rect(this.x, this.y, this.word.length * 10, 30);
    fill(255);
    textAlign(CENTER);
    text(this.word, this.x, this.y + 3);
  }
}
