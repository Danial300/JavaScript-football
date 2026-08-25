class Ball {
  constructor(x, y, radius, groundY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.groundY = groundY; // موقعیت زمین بازی برای محاسبه برخورد
        
    // سرعت‌های اولیه
    this.vx = 0;
    this.vy = 0;
        
    // پارامترهای فیزیکی
    this.gravity = 0.8;
    this.bounce = -0.7;
    this.friction = 0.98;
    this.color = '#FFD700'; // زرد طلایی
  }

  // متد رسم توپ روی کانواس
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x , this.y , this.radius , 0 , Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.closePath();
  }

  update(canvasWidth, canvasHeight, goal) {
    // جاذبه روی سرعت عمودی اثر می‌گذارد
    this.vy += this.gravity;

    // تغییر موقعیت بر اساس سرعت‌ها
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.friction;

    const ballGroundY  = this.groundY - this.radius;

    if(this.y + this.radius >= this.groundY) {
      console.log({
    vyBefore: this.vy,
    bounce: this.bounce,
    vyAfter: this.vy * -this.bounce
  });
      this.y = ballGroundY;
      this.vy = this.vy * -this.bounce;
      //this.vx = this.vx * this.friction;

      // متوقف کردن لرزش‌های ریز
      if (Math.abs(this.vy) < 0.2) this.vy = 0;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    const isInsideGoalHeight =
    this.y + this.radius > goal.topOffset &&
    this.y - this.radius < goal.topOffset + goal.height;

// دیواره‌ی چپ؛ فقط بیرون از محدوده‌ی دروازه
if (this.x - this.radius <= 0 && !isInsideGoalHeight) {
    this.x = this.radius;
    this.vx *= -0.8;
}

// دیواره‌ی راست؛ فقط بیرون از محدوده‌ی دروازه
if (
    this.x + this.radius >= canvasWidth &&
    !isInsideGoalHeight
) {
    this.x = canvasWidth - this.radius;
    this.vx *= -0.8;
}


}
}