let demographics = {
  ethnicity: [
    "White/Caucasian", "Black/African American", "Hispanic/Latino", "East Asian", 
    "South Asian", "Middle Eastern", "Indigenous/First Nations", "Pacific Islander", 
    "Multiracial", "Afro-Latino", "Central Asian", "North African"
  ],
  age: [
    "Infant (0-2)", "Toddler (3-5)", "Child (6-12)", "Adolescent (13-17)", 
    "Young Adult (18-24)", "Adult (25-34)", "Adult (35-44)", "Middle Aged (45-54)", 
    "Senior (55-64)", "Elderly (65-74)", "Octogenarian (80+)"
  ],
  gender: [
    "Cisgender Man", "Cisgender Woman", "Transgender Man", "Transgender Woman", 
    "Non-binary", "Genderqueer", "Agender", "Genderfluid", "Bigender"
  ],
  sexuality: [
    "Heterosexual", "Homosexual", "Bisexual", "Pansexual", "Asexual", 
    "Queer", "Demisexual", "Polysexual"
  ],
  politics: [
    "Left-wing", "Right-wing", "Centrist", "Libertarian", "Socialist", 
    "Green/Environmentalist", "Authoritarian", "Anarchist", "Progressive", 
    "Traditionalist", "Populist", "Non-voter"
  ],
  religion: [
    "Atheist", "Agnostic", "Roman Catholic", "Protestant", "Muslim (Sunni)", 
    "Muslim (Shia)", "Jewish", "Hindu", "Buddhist", "Sikh", "Spiritual/Non-religious", 
    "Taoist"
  ],
};
let brands = ["Louis Vuitton", "Tencent", "Visa","McDonald's", "YouTube", "Instagram", "Facebook", "Apple", "NVIDIA", "Amazon", "Google"
  ]


let video;
let keypoints;
let allHitPoints = [];
let textBoxes = []; // 

let myDigitalIdentity = []
let myEthnicity, myGender, myAge, mySexuality, myPolitics, myReligion;

// ML5 SETUP
let bodyPose;
let connections;
let poses = [];

// BUTTON SETUP
let pointsToggle;
let showPoints = false;
let cameraToggle;
let showCamera = false;

function preload() {
  // Initialize MoveNet/Blazepose model for body pose detection
  // bodyPose = ml5.bodyPose("MoveNet"); // movenet
  bodyPose = ml5.bodyPose("BlazePose"); // blazepose

  // Retrieve the skeleton structure used by the model
  connections = bodyPose.getSkeleton();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15);
  video = createCapture(VIDEO);
  // video = createCapture(VIDEO, { flipped: true });
  video.size(1080, 720);
  video.hide();

  // Start detecting poses in the loaded image
  bodyPose.detectStart(video, gotPoses);

  // ---- show points button
  pointsToggle = createButton("show points");
  pointsToggle.position(30, 80);
  pointsToggle.class("button-50")
  pointsToggle.mousePressed(() => {
    showPoints = !showPoints;
  });
  // ---- show camera button
  cameraToggle = createButton("show camera");
  cameraToggle.position(160, 80);
  cameraToggle.class("button-50")
  cameraToggle.mousePressed(() => {
    showCamera = !showCamera;
  });

  // ---- define random demographic objects
  // myEthnicity = random(demographics.ethnicity);
  // myGender = random(demographics.gender);
  // mySexuality = random(demographics.sexuality);
  // myAge = random(demographics.age);
  // myPolitics = random(demographics.politics);
  // myReligion = random(demographics.religion);

  // pre-assign someone to one from each category 
  myDigitalIdentity = [
    myEthnicity = random(demographics.ethnicity), 
    myGender = random(demographics.gender), 
    mySexuality = random(demographics.sexuality), 
    myAge = random(demographics.age), 
    myPolitics = random(demographics.politics), 
    myReligion = random(demographics.religion), 
  ]
  myBrand = random(brands);

  // -- this is to loop the object in
  for (let i = 0; i < 100; i++) {
    // let categories = Object.keys(demographics);
    // let randomCat = random(categories);
    // let pickedWord = random(demographics[randomCat]);
    let pickedWord = random(myDigitalIdentity);

    // to update later with the python callback of deepFace data == age, ethnicity, and gender. At the moment it is random.
    textBoxes[i] = new TextBox(0, 0, pickedWord);
  }
}

function gotPoses(results) {
  // Store detected poses in the global array
  poses = results;
}

// -- helper function to create more hitpoints for the body tracking, mostly around the torso so the body feels fuller
function getMid(p1, p2, percent = 0.5) {
  if (!p1 || !p2) {
    return { x: 0, y: 0 };
  }
  return {
    // returns double hit points anyway
    x: lerp(p1.x, p2.x, percent),
    y: lerp(p1.y, p2.y, percent),
  };
}

function mapToCanvas(rawX, rawY) {
  return {
    x: map(rawX, 0, video.width, width, 0),
    y: map(rawY, 0, video.height, 0, height),
  };
}

function updateHitPoints(pose) {
  allHitPoints = [];
  let mappedKps = pose.keypoints.map((kp) => mapToCanvas(kp.x, kp.y));

  for (let pt of mappedKps) {
    allHitPoints.push(pt);
  }

  // this is the neck
  let midN = getMid(mappedKps[12], mappedKps[11]);
  allHitPoints.push(midN);

  // middle left
  let midL = getMid(mappedKps[12], mappedKps[24]);
  allHitPoints.push(midL);

  // middle right
  let midR = getMid(mappedKps[11], mappedKps[23]);
  allHitPoints.push(midR);

  // middle hips
  let midH = getMid(mappedKps[24], mappedKps[23], 0.5);
  allHitPoints.push(midH);

  // middle torso
  let midTorso = getMid(midN, midH, 0.5);
  allHitPoints.push(midTorso);

  let midTorsoTop = getMid(midN, midH, 0.25);
  allHitPoints.push(midTorsoTop);
  let midTorsoBottom = getMid(midN, midH, 0.75);
  allHitPoints.push(midTorsoBottom);
  let midLeftTorso = getMid(midL, midTorso, 0.5);
  allHitPoints.push(midLeftTorso);
  let midRightTorso = getMid(midTorso, midR, 0.5);
  allHitPoints.push(midRightTorso);
}

function draw() {
  background("#c30202");

  // header text
  noStroke();
  fill(255);
  textAlign(LEFT);
  textSize(21);
  textFont("Courier New");
  text("How Machines See", 20, 40);
  textSize(16)
  text('stand away from the screen to see your full demographic breakdown', 20, 60);

  // if button pressed... show video
  if (showCamera === true) {
    // imageMode(CENTER);
    push();
    translate(width, 0);
    scale(-1, 1);
    image(
      video,
      width / 2 - video.width / 2,
      height / 2 - video.height / 2,
      1080,
      720,
    );
    pop();
  }

  // Ensure at least one pose is detected before proceeding
  if (poses.length > 0) {
    let pose = poses[0];
    updateHitPoints(pose);

    ///// ------------ TOGGLE POINTS ON THE BUTTON
    if (showPoints === true) {
      // ---- HERE ARE ALL THE POINTS
      for (let i = 0; i < allHitPoints.length; i++) {
        let keypoint = allHitPoints[i];
        stroke("#ffffff");
        noFill();
        let graphicSize = 20;
        // circle(keypoint.x, keypoint.y, 50);
        line(keypoint.x - (graphicSize / 2), keypoint.y - (graphicSize / 2), keypoint.x + graphicSize, keypoint.y + graphicSize);
        line(keypoint.x + graphicSize, keypoint.y - (graphicSize / 2), keypoint.x - (graphicSize / 2), keypoint.y + graphicSize);
      }
    }

    // -------- CALL DEMOGRAPHIC DATA IN TEXT BOXES AROUND THE BODY --------------
    if (showPoints === false) {
      for (let i = 0; i < allHitPoints.length; i++) {
            if (textBoxes[i]) {
              textBoxes[i].x = allHitPoints[i].x;
              textBoxes[i].y = allHitPoints[i].y;
              textBoxes[i].display();
            }
          }
        }
      }
}
