class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    mode = 1;
    allRedPockected = false;
    previousHitColor = null;
    sinkedBalls = [];

    static hitOrderCheck = function(hitColor) {
        if (!colorOrder.includes(hitColor)) {
            console.error("Invaild Color");
            return;
        }
        
        if (allRedPockected) {

        } else {
            if (hitColor === "#ff0000") {
                score++;
                
            } else {

            }
        }

        previousHitColor = hitColor;
    }
}