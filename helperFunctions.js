function drawMousePos() {
  push();
  strokeWeight(0.4);
  stroke(255);
  fill(255);
  text(`${mouseX}, ${mouseY}`, mouseX, mouseY);
  pop();
}
