
/*
//TODO implement these googs as needed for deployment
goog.provide('CTATProtractor');
goog.require('CTATGlobals');
goog.require('CTATGlobalFunctions');
goog.require('CTAT.Component.Base.SVG');
goog.require('CTAT.Component.Base.Tutorable');
goog.require('CTAT.ComponentRegistry');
goog.require('CTATSAI');

*/



var CTATProtractor = function (aDescription, aX, aY, aWidth, aHeight) {
    CTAT.Component.Base.SVG.call(this, "CTATProtractor", "aProtractor", aDescription, aX, aY, aWidth, aHeight);
    this.magnitude;
    this.numIntPoints = 1;       //defaults to only one moveable point A.
    this.radians = 0;       //defaults to no radian values.
    this.interval = 15;     //defaults to 15 degree interval.
    this.snap = true;      //snapping off by default.
    this.snaps = [];
    this.protRays = [];
    this.origin = { x: null, y: null };
    this.leftBound;     // Bounds are so that ray drags do not fall outside the SVG canvas
    this.rightBound;
    this.topBound;
    this.bottomBound;
    this.fadespd = 1000; //fade in/out speed for protray animations

    this.basePointString = "OB";
    this.baseOrigin = "O";  //is the name of the origin point
    this.basePoints = {};   // only contains up to two base rays
    this.interactivePointString = "A";
    this.interactivePoints = {};
    this.innerLabels = 'none';
    this.outerLabels = "counterclockwise degrees"


    //this is for the chooseAngle method, and also set by setAngle - used in incorrect highlighting?
    this.chosenAngle;
    this.chosen = false;
    this.measureunit = 'degrees';
    this.precision = 2;
    this.denominator = null;
    this.dragOnArc = true;

    this.radsnap = false;
    this.radsnaps = [];

    var svgNS = CTATGlobals.NameSpace.svg;  // convenience reference
    var userSelectedProtRay; //needed for event handlers


    /*************** ProtRay Setup ***************/
	/**
	 * Private object for managing a protractor ray.
	 * Protractor Rays (aka protrays) are the lines that eminate from the protractor origin and allow interaction.
	 * @param {CTATProtractor} protractor	The protractor that contains the ProtRay(s).
	 * @param {String} name	    Name and label of the protray
	 * @param {Number} x	Starting horizontal position of the protray inside its parent (pixels offset from origin)
	 * @param {Number} y	Starting vertical position of the protray inside its parent (pixels offset from origin)
	 * @param {Boolean} move	Whether the protray can be moved by the user (defaults to true)
	 */

    function ProtRay(protractor, name, x, y, move = true) {

        //FIXME the old x & y arguments need to be deprecated; since the arrow was added, x and y MUST be the on-arc
        // point that corresponds to 90 degrees, or the 'top' of the arc.  Otherwise the arrow is broken; requires
        // refactor to initial points args, render protray - start90 should probably become a protractor property.

        this.protractor = protractor;  //Parent CTATProtractor
        this.name = name;
        this.point;     //reference to SVG object at end of ray; 'grabbable' on movable protrays
        this.ray;       //reference to SVG line beginning at origin and ending at point
        this.label;     //reference to SVG text that travels alongside of this.point
        this.arrow;     //reference to SVG arrow that travels beyond top of this.point
        this.x = x;     // x position of center of this.point for first offset
        this.y = y;     // y position of center of this.point for first offset
        this.move = move;   //is this a movable protray?
        this.bd; // this corresponds to the base degree system, as well as angle ?BD for this protractor
        var self = this;  // used in animation callback for setPoint.
        this.scalefactor;   //scale factor needed to make arrowheads scale with size
        this.df;  // document fragment for creation.
        this.hidden = false; //boolean to determine if a protray is currently hidden.

        this.renderProtRay = function () {
            this.scalefactor = self.protractor.magnitude/320;
            
            this.label.setAttributeNS(null, 'x', this.x + self.protractor.magnitude * .09);
            this.label.setAttributeNS(null, 'y', this.y);

            this.ray.setAttributeNS(null, 'x1', self.protractor.origin.x);
            this.ray.setAttributeNS(null, 'y1', self.protractor.origin.y);
            this.ray.setAttributeNS(null, 'x2', this.x);
            this.ray.setAttributeNS(null, 'y2', this.y);

            this.point.setAttributeNS(null, 'cx', this.x);
            this.point.setAttributeNS(null, 'cy', this.y);
            this.point.setAttributeNS(null, 'r', 3 + 3*this.scalefactor);

            this.arrow.setAttributeNS(null, 'points', this.x+","+this.y+" "+(this.x+5*this.scalefactor)+","+(this.y+3*this.scalefactor)+" "+this.x+","+(this.y-10*this.scalefactor)+" "+(this.x-5*this.scalefactor)+","+(this.y+3*this.scalefactor));
        }

        this.rerenderProtray = function () {
            start90 = this.protractor.getPointFromAnglitude(90, this.protractor.magnitude);
            this.x = start90.x;
            this.y = start90.y;

            this.renderProtRay();

            this.moveTo(this.protractor.getPointFromAnglitude(this.bd, this.protractor.magnitude));

        }

        this.createProtRay = function () {
            // this creates the necessary svg elements, adds them to the canvas and gives their refs to ProtRay object
            this.scalefactor = self.protractor.magnitude/320;
            this.df = document.createDocumentFragment();
            

            label = document.createElementNS(svgNS, "text");
            label.classList.add("CTATProtractor--labelray");
            label.setAttributeNS(null, 'id', 'label_' + this.name);
            label.appendChild(document.createTextNode(this.name));

            ray = document.createElementNS(svgNS, "line");
            ray.setAttributeNS(null, 'id', 'ray_' + this.name);

            point = document.createElementNS(svgNS, "circle");
            point.setAttributeNS(null, 'id', 'point_' + this.name);

            arrow = document.createElementNS(svgNS, "polygon");
            arrow.setAttributeNS(null, 'id', 'arrow_' + this.name);

            self.point = point;
            self.ray = ray;
            self.label = label;
            self.arrow = arrow;

            this.renderProtRay();

            this.df.appendChild(label);
            this.df.appendChild(ray);
            this.df.appendChild(arrow);
            this.df.appendChild(point);
        }
        this.createProtRay();  // call it on object instantiation

        this.drawProtRay = function () {
            if (this.move) {
                this.point.classList.add("CTATProtractor--select");
                self.protractor._protrays.append(this.df);
            } else {
                self.protractor._fgrays.append(this.df);
            }
            this.bd = this.getAngle();
        }

        // helper methods for ProtRay objects

        // necessary for the startDrag event to find the protray.
        this.point.getProtRay = function () {
            return self;
        }

        /*
         *Protray Movement Methods 
         */


        this.moveTo = function (coord) {

            move_angle = self.protractor.calcAngle(coord)
            move_mag = self.protractor.calcMagMult(coord)

            //need to restore coord
            point_coord = self.protractor.getPointFromAnglitude(move_angle, self.protractor.magnitude);
            ray_coord = self.protractor.getPointFromAnglitude(move_angle, self.protractor.magnitude*(move_mag+.075));

            // moves all of the component pieces to a coordinate
            this.point.setAttributeNS(null, 'cx', coord.x);
            this.point.setAttributeNS(null, 'cy', coord.y);
            this.ray.setAttributeNS(null, 'x2', ray_coord.x);
            this.ray.setAttributeNS(null, 'y2', ray_coord.y);
            
            // all rays MUST start at 90 degrees for this to work; otherwise their ref coord system will be off.
            // could probably make this a var but not worth the extra complication.
            arrow_angle = move_angle-90;

            //arrowhead movement is complicated, but this is about as simple as it gets
            this.arrow.setAttributeNS(null, 'transform', "rotate("+arrow_angle+" "+protractor.origin.x+" "+protractor.origin.y+") "
                                                        +"translate(0 "+(1-move_mag-.075)*self.protractor.magnitude+")");


            //label needs to change which side of the marker its on
            if(this.move) {
                

                if(move_angle < 60 || move_angle > 120) {
                    this.label.setAttributeNS(null, 'y', coord.y * 1.1);
                } else {
                    this.label.setAttributeNS(null, 'y', coord.y * .9);
                }

                if (coord.x >= this.protractor.origin.x) {
                    this.label.setAttributeNS(null, 'x', coord.x + self.protractor.magnitude * .07);
                } else {
                    this.label.setAttributeNS(null, 'x', coord.x - self.protractor.magnitude * .07);
                }
            }  else {
                this.label.setAttributeNS(null, 'x', coord.x);
                this.label.setAttributeNS(null, 'y', coord.y + self.protractor.magnitude * .08);
            }

            this.bd = this.getAngle();
        }


        this.setPoint = function (set_angle) {
            // moves the ProtRay to a new angle, and animates the movement

            let startAngle = Math.floor(this.getAngle());
            let finalAngle = Math.floor(set_angle);

            // console.log("Start angle: " + startAngle);  //DBG startangle/finalAngle for setPoint
            // console.log("Final angle: " + finalAngle);

            let dir = true; // direction: true means travel clockwise, false means counterclockwise
            if (startAngle - finalAngle > 0) {
                dir = false;
            } else if (startAngle == finalAngle) {
                self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude));
                return;
            }

            let frame = 11; //time in ms between frames, used in animFrame

            function animFrame(i) {
                setTimeout(function () {
                    self.moveTo(self.protractor.getPointFromAnglitude(i, self.protractor.magnitude));
                    if (dir) { i++ } else { i-- };
                    if (i != finalAngle) {
                        setTimeout(function () { animFrame(i); }, frame);
                    } else {
                        setTimeout(function () { self.moveTo(self.protractor.getPointFromAnglitude(finalAngle, self.protractor.magnitude)); }, frame)
                    }
                    frame  // this is the time in ms between frames
                });
            }

            let i = startAngle;
            animFrame(i);

        }

        this.differentialProtrayMove = function (oppProtray, set_angle) {

            //TODO need to examine case of negative values, and make sure it doesn't error

            if(!this.move) {
                console.error("Ray \""+this.name+"\" is a non-moving base ray, so should not move.");
                return false;
            }

            var currentDiff = this.bd - oppProtray.bd;
            var moveAngle = set_angle - Math.abs(currentDiff);

            var newAngle;

            if (Math.abs(moveAngle) < 1) {
                return false;
            } else {
                if (currentDiff < 0) {  // current protray is to the left of oppProtray 
                    newAngle = this.bd - moveAngle;
                    if (newAngle < 0 || newAngle > 180) {
                        newAngle = oppProtray.bd + moveAngle;
                        if (newAngle < 0 || newAngle > 180) {
                            console.log("New angle not possible with Ray " + this.name);
                            return false;
                        }
                    }
                } else {                // current protray is to the right of oppProtray
                    newAngle = this.bd + moveAngle;
                    if (newAngle < 0 || newAngle > 180) {
                        newAngle = oppProtray.bd - moveAngle;
                        if (newAngle < 0 || newAngle > 180) {
                            console.log("New angle not possible with Ray " + this.name);
                            return false;
                        }
                    }
                }
            }

            this.setPoint(newAngle);
            return true;

        }


        this.getAngle = function () {
            // returns the current angle of the ProtRay, measured from left to right
            let x = this.point.getAttributeNS(null, 'cx');
            let y = this.point.getAttributeNS(null, 'cy');
            coord = { x: x, y: y };

            return this.protractor.calcAngle(coord);

        }


        // This generates the Input value for the "setAngle" Action
        this.genInput = function () {
            var input = {};

            function buildInput(value) {
                if(value.name != self.name) {
                    rep_value = Math.abs(Math.round(self.bd - value.bd));

                    if(!self.protractor.measureunit.includes("deg")){
                        rep_value = self.protractor.convertUnits(rep_value);
                    }
                    input[self.name+self.protractor.baseOrigin+value.name] = rep_value;
                }
            }
            
            Object.values(this.protractor.basePoints).forEach(buildInput);
            Object.values(this.protractor.interactivePoints).forEach(buildInput);

            return input;
        }

        /* Miscellaneous functions to help with styling and selection */

        this.deactivateProtRay = function () {
            this.point.classList.add('unselectable');
            this.point.classList.remove('CTATProtractor--select');
        }

        this.reactivateProtRay = function () {
            this.point.classList.remove('unselectable');
            this.point.classList.add('CTATProtractor--select');
        }

        this.hideProtRay = function () {
            this.deactivateProtRay();
            $('#point_' + this.name).hide();
            $('#label_' + this.name).hide();
            $('#ray_' + this.name).hide();
            $('#arrow_' + this.name).hide();
            this.hidden = true;
        }

        this.showProtRay = function () {
            this.reactivateProtRay();
            $('#point_' + this.name).show();
            $('#label_' + this.name).show();
            $('#ray_' + this.name).show();
            $('#arrow_' + this.name).show();
            this.hidden = false;
        }

        this.fadeOutProtRay = function () {
            this.deactivateProtRay();
            $('#point_' + this.name).fadeOut(this.protractor.fadespd);
            $('#label_' + this.name).fadeOut(this.protractor.fadespd);
            $('#ray_' + this.name).fadeOut(this.protractor.fadespd);
            $('#arrow_' + this.name).fadeOut(this.protractor.fadespd);
            this.hidden = true;
        }

        this.fadeInProtRay = function () {
            this.reactivateProtRay();
            $('#point_' + this.name).fadeIn(this.protractor.fadespd);
            $('#label_' + this.name).fadeIn(this.protractor.fadespd);
            $('#ray_' + this.name).fadeIn(this.protractor.fadespd);
            $('#arrow_' + this.name).fadeIn(this.protractor.fadespd);
            this.hidden = false;
        }

        this.styleCorrect = function () {
            this.deStyle();
            this.ray.classList.add('CTATProtractor--correct');
        }
        this.styleIncorrect = function () {
            this.deStyle();
            this.point.classList.add('CTATProtractor--incorrect');
            this.ray.classList.add('CTATProtractor--incorrect');
        }
        this.styleHint = function () {
            this.deStyle();
            this.point.classList.add('CTATProtractor--hint');
            this.ray.classList.add('CTATProtractor--hint');
        }

        this.deStyle = function () {
            this.point.classList.remove('CTATProtractor--correct');
            this.point.classList.remove('CTATProtractor--incorrect');
            this.point.classList.remove('CTATProtractor--hint');

            this.ray.classList.remove('CTATProtractor--correct');
            this.ray.classList.remove('CTATProtractor--incorrect');
            this.ray.classList.remove('CTATProtractor--hint');
        }


    }



    /*************** Component Parameters ******************/

    /**
    * This is run during the generation of InterfaceDescription messages and
    * it generates interface actions for options set by the author in the
    * html code.
    * @returns {Array<CTATSAI>} of SAIs.
    */
    this.getConfigurationActions = function () {
        var actions = [];
        var sai;
        var $div = $(this.getDivWrap());
        if ($div.attr('data-ctat-interactive-points')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setInteractivePoints');
            sai.setInput($div.attr('data-ctat-interactive-points'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-base-points')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setBasePoints');
            sai.setInput($div.attr('data-ctat-base-points'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-outer-labels')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setOuterLabels');
            sai.setInput($div.attr('data-ctat-outer-labels'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-inner-labels')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setInnerLabels');
            sai.setInput($div.attr('data-ctat-inner-labels'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-unit-of-measure')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setUOM');
            sai.setInput($div.attr('data-ctat-unit-of-measure'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-precision')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setRadPrecision');
            sai.setInput($div.attr('data-ctat-precision'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-interval')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setInterval');
            sai.setInput($div.attr('data-ctat-interval'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-snap')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setSnap');
            sai.setInput($div.attr('data-ctat-snap'));
            actions.push(sai);
        }
        if ($div.attr('data-ctat-drag-on-arc')) {
            sai = new CTATSAI();
            sai.setSelection(this.getName());
            sai.setAction('setDragOnArc');
            sai.setInput($div.attr('data-ctat-drag-on-arc'));
            actions.push(sai);
        }

        // actions.forEach(function(value) {console.log(value.getAction() + ": "+ value.getInput())})

        return actions;
    };


    this.setInteractivePoints = function (pointString) {
        this.interactivePointString = pointString;
        var numPoints = pointString.length;
        this.numIntPoints = numPoints;
    }
    this.setParameterHandler('interactivePoints', this.setInteractivePoints);
    this.data_ctat_handlers['interactivePoints'] = this.setInteractivePoints;

    this.setBasePoints = function (pointString) {
        this.basePointString = pointString;
    }
    this.setParameterHandler('basePoints', this.setBasePoints);
    this.data_ctat_handlers['basePoints'] = this.setBasePoints;

    this.setUOM = function (measureunit) {
        //sets snapping for the protractor
        if (measureunit.includes("rad")) {
            this.measureunit = "rad";
            this.radsnap = true;
        } else if (measureunit.includes("frac")) {
            this.measureunit = "frac";
            this.radsnap = true;
        }
    }
    this.setParameterHandler('unitOfMeasure', this.setUOM);
    this.data_ctat_handlers['unitOfMeasure'] = this.setUOM;

    this.setRadPrecision = function (precision) {
        //sets sig digits for radian values (default 2) or fractional radian denominator.
        
        if(this.measureunit.includes("frac")){
            this.denominator = precision;
        } else {
            this.precision = precision;
        }

    }
    this.setParameterHandler('precision', this.setRadPrecision);
    this.data_ctat_handlers['precision'] = this.setRadPrecision;

    this.setSnap = function (snapbool) {
        //sets snapping for the protractor
        if(!snapbool){
            this.snap = false;
        }

    }
    this.setParameterHandler('snap', this.setSnap);
    this.data_ctat_handlers['snap'] = this.setSnap;

    this.setInterval = function (interval) {

        if (180 % interval !== 0 || interval > 90) {
            console.log("Unacceptable value for data-ctat-interval set.  Value must evenly divide 180 degrees. Defaulting to 15.")
            return;
        }

        this.interval = interval;
    }
    this.setParameterHandler('interval', this.setInterval);
    this.data_ctat_handlers['interval'] = this.setInterval;


    this.setDragOnArc = function (dragonset) {
        //sets snapping for the protractor
            this.dragOnArc = dragonset;

    }
    this.setParameterHandler('dragOnArc', this.setDragOnArc);
    this.data_ctat_handlers['dragOnArc'] = this.setDragOnArc;


    /*************** Event Handlers ******************/
    var handle_drag_start = function (evt) {
        if (evt.target.classList.contains('CTATProtractor--select')) {
            evt.preventDefault();
            this.removeRayStyles();
            userSelectedProtRay = evt.target.getProtRay();
        }
    }.bind(this);

    var handle_drag = function (evt) {
        if (userSelectedProtRay) {
            evt.preventDefault();
            var coord = this.getMousePosition(evt);
            if (coord.x < this.leftBound) { coord.x = this.leftBound; };
            if (coord.x > this.rightBound) { coord.x = this.rightBound; };
            if (coord.y < this.topBound) { coord.y = this.topBound; };
            if (coord.y > this.bottomBound) { coord.y = this.bottomBound; };

            if (this.snap) {
                userSelectedProtRay.moveTo(this.getClosestSnap(coord));
            } else if (this.radsnap) {
                userSelectedProtRay.moveTo(this.getClosestSnap(coord, true));
            } else if (this.dragOnArc) {
                userSelectedProtRay.moveTo(this.getPointFromAnglitude(this.calcAngle(coord), this.magnitude));
            } else {
                userSelectedProtRay.moveTo(coord);
            }

        }
    }.bind(this);

    var handle_drag_end = function (evt) {
        if (userSelectedProtRay) {
            var coord = this.getMousePosition(evt);

            if (this.snap) {
                coord = this.getClosestSnap(coord);
            } else if (this.radsnap) {
                coord = this.getClosestSnap(coord, true);
            }
            var new_angle = Math.round(this.calcAngle(coord));
            if(new_angle < 0) { new_angle = 0;} else if(new_angle>180) {new_angle = 180;};
            userSelectedProtRay.setPoint(new_angle);

            sas_input = userSelectedProtRay.genInput();

            //have to handle possibility of chooseAngle
            var action_input;
            if(this.chosen) {
                if(sas_input[this.chosenAngle] !==undefined ) {
                    action_input = sas_input[this.chosenAngle];
                } else if (sas_input[this.chosenAngle.charAt(2)+this.chosenAngle.charAt(1)+this.chosenAngle.charAt(0)]) {
                    action_input = sas_input[this.chosenAngle.charAt(2)+this.chosenAngle.charAt(1)+this.chosenAngle.charAt(0)];
                } else {
                    //TODO report chosen erro - student moved an incorrect ray unrelated to chosen angle
                    // empty string, or N/A?  
                    // maybe defined constant (eg strings from CTAT Language pack for translations)
                    // maybe NaN

                    action_input = "Incorrect point selected!";
                }
                // console.log(action_input);

            } else {
                action_input = JSON.stringify(sas_input).slice(1,-1);
            }
            
            this.setActionInput("setAngle", action_input);
            this.processAction();

            userSelectedProtRay = null;
        }
    }.bind(this);

    /* Event Handler helper functions */

    this.getMousePosition = function (evt) {
        var CTM = this.component.firstElementChild.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        }
    }

    this.removeRayStyles = function () {
        // runs during handle-drag start to remove certain highlights.
        Object.values(this.interactivePoints).forEach(function (item) {
            item.deStyle();
        });

        Object.values(this.basePoints).forEach(function (item) {
            item.deStyle();
        });
    }


    /**
     * CTAT Protractor initialization
     */
    this.init = function () {
        
        var div = this.getDivWrap();
        // Create the SVG element, and add the needed group elements to it.
        this.initSVG();
        this.component.classList.add('CTATProtractor--container');
        this._compass = document.createElementNS(svgNS, 'g');
        this._compass.classList.add('CTATProtractor--compass', 'unselectable');
        this._labels = document.createElementNS(svgNS, 'g');
        this._labels.classList.add('CTATProtractor--labels', 'unselectable');
        this._fgrays = document.createElementNS(svgNS, 'g');
        this._fgrays.classList.add('CTATProtractor--fgrays', 'unselectable');
        this._protrays = document.createElementNS(svgNS, 'g');
        this._protrays.classList.add('CTATProtractor--protrays');

        this.component.appendChild(this._compass);
        this.component.appendChild(this._labels);
        this.component.appendChild(this._fgrays);
        this.component.appendChild(this._protrays);



        // Add the event listeners.
        this.component.addEventListener('mousedown', handle_drag_start);
        this.component.addEventListener('mousemove', handle_drag);
        this.component.addEventListener('mouseup', handle_drag_end);

        this.dimensionalize();

        // This function checks to see if we are in fraction reporting mode, and overrides the interval if so.
        this.checkFractionInterval();

        // Draw the protractor, create protrays based on the initial elements, and add them to the SVG.
        this.drawCompass();

        this.initialBasePoints();

        this.initialInteractivePoints();
        this.initialPositions();

        this.checkSingleAngleMode();

        // Set snapping points in case snapping turned on.
        this.setSnaps();
        this.setRadSnaps();

        // Draw the labels 
        this.drawOriginLabel();
        this.drawLabels();

        // console.log("CTAT Protractor object on next line"); //DBG final protractor object
        // console.log(this);
        this.component.setAttributeNS(null, "viewBox", "0,0,800,400");
        this.component.setAttributeNS(null, "preserveAspectRatio", "xMidYMid meet");

        this.setComponent(div);


        // finish any initialization here.
        this.setInitialized(true);
        this.addComponentReference(this, div);
    };

    this.oldDimensionalize = function() {
        //this was the original dimensionalizing function when there was no viewbox.
        let bbox = this.getBoundingBox();

        this.leftBound = Math.floor(bbox.width * .05);
        this.rightBound = Math.floor(bbox.width * .95);
        this.topBound = Math.floor(bbox.height * .05);
        this.bottomBound = Math.floor(bbox.height * .95);

        // Dimension and position the protractor itself within the SVG
        this.magnitude = Math.min(bbox.width * .4, bbox.height * 0.8);
        this.origin.x = bbox.width / 2;
        this.origin.y = bbox.height / 2 + this.magnitude / 2;
    }

    this.dimensionalize = function() {
        // this was created when switching to a preserve aspect ratio/viewbox SVG scaling scheme
        let bbox = {"width":800, "height":400};

        this.leftBound = 10;
        this.rightBound = 790;
        this.topBound = 10;
        this.bottomBound = 360;

        // Dimension and position the protractor itself within the SVG
        this.magnitude = 320;
        this.origin.x = 400;
        this.origin.y = 360;

        this.setFontSize();
    }

    /**
     * setAngle
     * Primary action for the CTATProtractor, defines moving protrays around the interface and setting them
     * at a particular angle. 
     * 
     * @param {String} notJSONangles	A specifically formatted string of a JS object without parenthesis, where the key is the angle name, and the value is the angle measure.
     * 
     * notJSONangles specifies angles for each protray, e.g.:
     * "ABC": degree, "ABD": degree, "ABE": degree
     * A: ABC, ABD, ABE
     * B: EBC, EBD, ABE
     * 
     * When generated from the interface, JSONangles will contain all of the angles desired.
     * When matching for correctness, only the first angle specified will be considered.
     * 
     * When there are only two rays in the protractor (a base and an interactive), specified by this.chosen, setAngle
     * operates on only an integer input (the value of that angle in degrees)
     */


    this.setAngle = function (notJSONangles) {

        var JSONangles = "{"+notJSONangles+"}";
        var setAngle_selectedRay;  // Protray object being moved/set
        var setAngle_selectedKey;      // Key/name of object being moved/set
        var setAngle_oppKey;           // Key/name of protray opposite the protray being moved/set
        var setAngle_oppRay;           // Protray opposite the protray being moved/set

        // console.log(JSONangles);   //helpful for error checking

        //grab the first letter of the first angle specified in the JSON input; designates the targeted protray.
        if(this.chosen) {
            setAngle_selectedKey = this.chosenAngle.charAt(0)
            setAngle_oppKey = this.chosenAngle.charAt(2)
        } else {
            specified_angles = JSON.parse(JSONangles);
            setAngle_selectedKey = Object.keys(specified_angles)[0][0];
            setAngle_oppKey = Object.keys(specified_angles)[0][2];
        }

        setAngle_selectedRay = this.findProtray(setAngle_selectedKey);
        setAngle_oppRay = this.findProtray(setAngle_oppKey);

        targetAngleName = setAngle_selectedKey + this.baseOrigin + setAngle_oppKey;

        targetAngle = null;
        if(this.chosen) {
            targetAngle = notJSONangles;
        } else {
            targetAngle = specified_angles[targetAngleName];
        }

        if(targetAngle != null) {
            if(!this.measureunit.includes("deg")){
                targetAngle = this.convertToDegrees(targetAngle);
            }
            setAngle_selectedRay.differentialProtrayMove(setAngle_oppRay, targetAngle);
        } else {
            return;
        }
        
    };

    this.chooseAngle = function (angleName) {
        // Changes the protractor to "chosen" mode, where setAngle SAIs will now only produce numbers for
        // the single angle that has been chosen.
        this.chosenAngle = angleName;
        this.chosen = true;
    }

    this.findProtray = function(name) {
        if(this.interactivePoints[name]) {
            return this.interactivePoints[name];
        } else if (this.basePoints[name]) {
            return this.basePoints[name];
        } else {
            console.error("Point/Ray not found! Name: "+name);
        }
    }

    this.reportAngle = function(angle_name) {
        reportAngle_selectedKey = angle_name.charAt(0);
        reportAngle_oppKey = angle_name.charAt(2);
        reportAngle_selectedRay = this.findProtray(reportAngle_selectedKey);
        reportAngle_oppRay = this.findProtray(reportAngle_oppKey);

        reportAngle_final = this.convertUnits(Math.abs(reportAngle_selectedRay.bd - reportAngle_oppRay.bd));
        if(typeof reportAngle_final === "number") {
            reportAngle_final = Math.round(reportAngle_final);
        }
        return reportAngle_final;
    }


    this.initialInteractivePoints = function() {

        // this error check has to happen to remove redundant names; otherwise, redundant names will break point hiding/locking
        for(i=0; i<this.numIntPoints; i++) {
            if(this.basePointString.includes(this.interactivePointString.charAt(i))){
                console.error("Interactive point \""+this.interactivePointString.charAt(i)+"\" in CTATProtractor \""+this.getDivWrap().id+"\" is already a base point; choose unique names for all points!");
            } else {
                this.interactivePoints[this.interactivePointString.charAt(i)] = null;
            }
            
        }

        var numRays = Object.keys(this.interactivePoints);
        start90 = this.getPointFromAnglitude(90, this.magnitude);
        
        var setupFunc = function (value, index, array) {
            this.interactivePoints[value] = new ProtRay(this, value, start90.x, start90.y);
        }.bind(this)

        numRays.forEach(setupFunc);
        
        Object.values(this.interactivePoints).forEach(function(value){ value.drawProtRay();});
    }

    this.initialPositions = function() {
        //sets initial positions for rays, equal spacing from origin.
        intrv = Math.floor(180/(this.numIntPoints+1));
        if(intrv%2 === 1){
        }
        start = intrv;
        self = this;

        Object.values(this.interactivePoints).forEach(function(value){ 
            value.moveTo(self.getPointFromAnglitude(start, self.magnitude));
            start += intrv;
        });

    }

    this.initialBasePoints = function() {
        var numPoints = this.basePointString.length;

        if(numPoints <= 0) {
            return;
        } else {
            this.baseOrigin = this.basePointString.charAt(0);
            if(numPoints < 2) {
                return;
            }
        }

        start90 = this.getPointFromAnglitude(90, this.magnitude);

        if(numPoints>1) {
            point_name = this.basePointString.charAt(1);
            this.basePoints[point_name] = new ProtRay(this, point_name, start90.x, start90.y, false);
            this.basePoints[point_name].drawProtRay();
            this.basePoints[point_name].moveTo(this.getPointFromAnglitude(180,this.magnitude));
        }

        if(numPoints>2) {
            // error check for duplicate names 
            if(this.basePointString.charAt(1) === this.basePointString.charAt(2)) {
                console.warn("Duplicate names for base points in CTATProtractor \""+ this.getDivWrap().id+"\"; please check your data-ctat-base-points property.");
                this.basePointString = this.basePointString.slice(0,2);
                return;
            } else {
                point_name = this.basePointString.charAt(2);
                this.basePoints[point_name] = new ProtRay(this, point_name, start90.x, start90.y, false);
                this.basePoints[point_name].drawProtRay();
                this.basePoints[point_name].moveTo(this.getPointFromAnglitude(0,this.magnitude));
            }
            
        }

    }

    this.checkSingleAngleMode = function () {
        // if there is only a single interactive ray and a single base ray, switch to chooseAngle mode
        if(Object.keys(this.interactivePoints).length === 1 && Object.keys(this.basePoints).length === 1) {
            this.chooseAngle(this.interactivePointString + this.basePointString);
        } 
    }

    /*************** Drawing ***************/

    this.render = function() {

        // Re-renders the protractor with all current settings; not currently used in any other procedures

        // have to draw compass, labels, ticks, and rays with current position.
        // Dimension the SVG based on its parent size.
        this.dimensionalize();

        // Rerender the compass and tickmarks
        this.renderCompass();

        //Rerender the rays
        Object.values(this.interactivePoints).forEach(function(value) {
            value.rerenderProtray()
        });
        Object.values(this.basePoints).forEach(function(value) {
            value.rerenderProtray()
        });

        // Reset snapping points in case snaps are turned on.
        this.snaps = [];
        this.setSnaps();
        this.radsnaps = [];
        this.setRadSnaps();

        this.redrawLabels();
    }

    /*************** Compass Setup ***************/
    /**
    * These functions are used to draw the background compass
    * 
    * createTick and createTicks generate the tickmarks that are on the compass
    * drawCompass creates the arc at the appropriate size, then adds the tickmarks.
    */

    this.createTick = function (coord1, coord2) {
        tick = document.createElementNS(svgNS, "line");
        tick.setAttributeNS(null, 'x1', coord1.x);
        tick.setAttributeNS(null, 'y1', coord1.y);
        tick.setAttributeNS(null, 'x2', coord2.x);
        tick.setAttributeNS(null, 'y2', coord2.y);
        tick.classList.add("CTATProtractor--ticks");

        return tick;
    }

    this.createTicks = function () {
        intrv = this.interval;
        
        for (j = intrv; j <= 179; j += intrv) {
            coord1 = this.getPointFromAnglitude(j, this.magnitude * .97);
            coord2 = this.getPointFromAnglitude(j, this.magnitude * 1.03);
            this._compass.appendChild(this.createTick(coord1, coord2));
        }
    }

    this.checkFractionInterval = function() {
        // this checks to see if we're in fraction mode; if so, it overrides the user-provided interval
        // in favor of one provided as data-ctat-precision.
        // 
        if(this.denominator !== null) {
            this.interval = 180/this.denominator;
        }
    }

    this.deleteTicks = function () {
        ticks = this._compass.children;
        length = ticks.length;

        for (i = length - 1; i >= 1; i--) {
            ticks[i].remove();
        }
    }

    this.drawCompass = function () {
        compass = document.createElementNS(svgNS, "path");
        compass.setAttributeNS(null, 'd', "M " + this.origin.x + " " + this.origin.y +
            "H " + (this.origin.x + this.magnitude) +
            " A " + this.magnitude + " " + this.magnitude + " 0 0 0 " + (this.origin.x - this.magnitude) + " " + this.origin.y +
            " H " + this.origin.x);
        this._compass.appendChild(compass);
        this.createTicks();
    }

    this.renderCompass = function() {
        this.deleteTicks();

        this._compass.firstElementChild.setAttributeNS(null, 'd', "M " + this.origin.x + " " + this.origin.y +
        "H " + (this.origin.x + this.magnitude) +
        " A " + this.magnitude + " " + this.magnitude + " 0 0 0 " + (this.origin.x - this.magnitude) + " " + this.origin.y +
        " H " + this.origin.x);
        
        this.createTicks();
    }

    /*************** Label Setup ***************/
    /**
    * These functions are used to draw angle labels on top of the compass
    */

    this.resetLabels = function (labelcode) {
        this.compLabels = parseInt(labelcode);
        this.getDivWrap().setAttribute("data-ctat-complabels", labelcode);
        this.redrawLabels();
    }

    this.setFontSize = function () {
        // min font size of 6, scale up as magnitude increases.
        var fontSize = 7 + this.magnitude * .04;
        this.component.style.fontSize = fontSize + "px";
    }

    this.resetRadians = function (radcode) {
        this.radians = parseInt(radcode);
        this.getDivWrap().setAttribute("data-ctat-radians", labelcode);
        this.redrawLabels();
    }

    this.createLabel = function (x, y, text, htmlclass) {
        label = document.createElementNS(svgNS, "text");
        label.setAttributeNS(null, 'x', x);
        label.setAttributeNS(null, 'y', y);
        label.setAttributeNS(null, 'class', htmlclass);
        label.appendChild(document.createTextNode(text));
        this._labels.appendChild(label);
    }

    this.drawOriginLabel = function () {
        // This is the label for the origin point; different from all the other labeling of the compass.
        this.createLabel(this.origin.x, this.origin.y + this.magnitude * .07, this.baseOrigin, 'CTATProtractor--label-origin');
    }

    this.drawLabels = function () {
        if (90 % this.interval == 0) {
            if (this.outerLabels != 'none' &&  
            !((this.outerLabels.includes("rad") && this.innerLabels.includes("rad")) || (this.outerLabels.includes("deg") && this.innerLabels.includes("deg")))
            ) {
                this.drawLabel90("top");
            }
            if (this.innerLabels != 'none') {
                this.drawLabel90();
            }
        }

        if (this.outerLabels != 'none') {
            this.drawLabelOuter();
        }

        if (this.innerLabels != 'none') {
            this.drawLabelInner();
        }
    }

    this.redrawLabels = function () {
        this.deleteLabels();
        this.drawLabels();
        this.drawOriginLabel();
    }

    this.lookupRadians = function (degree) {
        // Provides the radian strings for radian labels.  Could also be used if we wanted text inputs in radians.

        fraction = this.reduceDegreesToFrac(degree);
        var numerator = fraction[0];

        if (fraction[0] === 0) {
            return '0';
        } else if (fraction[0] === 1) {
            numerator = "";
        }

        if (fraction[1] === 1) {
            return "π";
        }

        return numerator + "π/" + fraction[1];
    }

    //TODO should come up with and set a standard magnitude multiplier based on radian code, and an offset multiplier based on
    // magnitude (offset multiplier is used in coord.x-this.origin.x * multiplier in code below)
    // maybe its own method, uses this.radians and whether it's label1 or label2 to convert coords passed in?

    this.setOuterLabels = function (setString) {
        this.outerLabels = setString;
    }
    this.setParameterHandler('outer-labels', this.setOuterLabels);
    this.data_ctat_handlers['outer-labels'] = this.setOuterLabels;


    this.drawLabelOuter = function () {
        var rads = false;
        var clockwise = true; // false is counterclockwise

        if(this.outerLabels.includes("counter")) {
            var clockwise = false;
        }

        if (this.outerLabels.includes("rad")) {
            rads = true;
        }

        var intrv;
        (this.interval < 10) ? intrv = this.interval * 2 : intrv = this.interval;


        for (j = 0; j <= 180; j += intrv) {
            if (j !== 90) {
                coord = this.getPointFromAnglitude(j, this.magnitude * 1.1);
                label_num = (clockwise) ? j : 180 - j;
                if(j === 0 || j === 180) {
                    if(j === 0) {xcooord = coord.x - 20} else if (j === 180) {xcooord = coord.x + 20}
                    if (rads) {
                        this.createLabel(xcooord + (xcooord - this.origin.x) * .05, coord.y + 5, this.lookupRadians(label_num), 'outer');
                    } else {
                        this.createLabel(xcooord, coord.y + 5, label_num, 'outer');
                    }
                } else {
                    if (rads) {
                        this.createLabel(coord.x + (coord.x - this.origin.x) * .05, coord.y + 5, this.lookupRadians(label_num), 'outer');
                    } else {
                        this.createLabel(coord.x, coord.y + 5, label_num, 'outer');
                    }
                }
            }

        }
    }


    this.setInnerLabels = function (setString) {
        this.innerLabels = setString;
    }
    this.setParameterHandler('inner-labels', this.setInnerLabels);
    this.data_ctat_handlers['inner-labels'] = this.setInnerLabels;

    // drawLabelInner handles the "inner" labels.
    this.drawLabelInner = function () {
        var rads = false;
        var clockwise = true; // false is counterclockwise

        if(this.innerLabels.includes("counter")) {
            var clockwise = false;
        }

        if (this.innerLabels.includes("rad")) {
            rads = true;
        }

        var intrv;
        (this.interval < 10 || this.interval < 15 && rads) ? intrv = this.interval * 2 : intrv = this.interval;


        for (j = 0; j <= 180; j += intrv) {
            if (j !== 90) {
                label_num = (clockwise) ? j : 180 - j;
                coord = this.getPointFromAnglitude(j, this.magnitude * 0.9);
                if (j === 0 || j === 180) {
                    if (rads) {
                        this.createLabel(coord.x, coord.y - 5, this.lookupRadians(label_num), 'inner');
                    } else {
                        this.createLabel(coord.x, coord.y - 5, label_num, 'inner');
                    }
                } else {
                    if (rads) {
                        this.createLabel(coord.x - (coord.x - this.origin.x) * .07, coord.y, this.lookupRadians(label_num), 'inner');
                    } else {
                        this.createLabel(coord.x, coord.y, label_num, 'inner');
                    }

                }
            }
        }

    }

    this.drawLabel90 = function (location = "bottom") {
        var rad = false;
        var mag = this.magnitude * 0.88;

        if (location == "top") {
            mag = this.magnitude * 1.05;
            if (this.outerLabels.includes("rad")) {
                rad = true;
            }
        } else if (this.innerLabels.includes("rad")) {
            rad = true;
        }

        coord = this.getPointFromAnglitude(90, mag);
        var text;
        if (rad) {
            text = this.lookupRadians(90);
        } else { text = '90'; }
        this.createLabel(coord.x, coord.y, text, 'CTATProtractor--label90');
    }


    this.hideLabels = function (labelset) {

        if (labelset == "outer") {
            $(".outer").hide();
        } else if (labelset == "inner") {
            $(".inner").hide();
        } else {
            $(".outer").hide();
            $(".inner").hide();
            $(".CTATProtractor--label90").hide();
        }
    }

    this.showLabels = function (labelset) {

        if (labelset == "outer") {
            $(".outer").show();
        } else if (labelset == "inner") {
            $(".inner").show();
        } else {
            $(".outer").show();
            $(".inner").show();
            $(".CTATProtractor--label90").show();
        }
    }

    this.deleteLabels = function () {
        labels = this._labels.children;
        length = labels.length;

        for (i = length - 1; i >= 0; i--) {
            labels[i].remove();
        }
    }

    /*************** Angle Helpers ***************/
    /**
    * These functions are used to convert angles and (x, y) points back and forth
    */

    this.calcAngle = function (newCoords) {
        // Takes a set of (x,y) coordinates, and returns an angle in degrees based on the origin of protractor
        let x = newCoords.x;
        let y = newCoords.y;

        var rise;
        var run;
        var acute = true;

        // account for which side of the protractor x is on
        if (x <= this.origin.x) {
            run = this.origin.x - x;
        } else {
            run = x - this.origin.x;
            acute = false;
        }
        // limit y so that it only measures 'above' the protractor base
        if (y <= this.origin.y) {
            rise = this.origin.y - y;
        } else {
            rise = 0;
        }

        calcd_angle = (Math.atan(rise / run)) * (180 / Math.PI);
        if (!acute) {
            calcd_angle = 180 - calcd_angle;
        }

        return calcd_angle;

    }

    this.calcMagMult = function (newCoords) {
        // Takes a set of (x,y) coordinates, and returns the multiplier for the current magnitude
        let x = newCoords.x;
        let y = newCoords.y;

        x_mag = (x - this.origin.x)**2
        y_mag = (y - this.origin.y)**2

        return Math.sqrt(x_mag + y_mag)/this.magnitude;
    }

    this.getPointFromAnglitude = function (inp_angle, magnitude) {
        // Takes an angle and magnitude from centerX,Y and returns the xy coord in the canvas for it.

        x = this.origin.x - (Math.cos(inp_angle * Math.PI / 180) * magnitude);
        y = this.origin.y - (Math.sin(inp_angle * Math.PI / 180) * magnitude);
        coord = { x: x, y: y };
        return coord;
    }

    this.convertUnits = function(degree_val) {
        var converted_val = degree_val;
        
        if(this.measureunit.includes("rad")) {
            converted_val = (degree_val*Math.PI/180).toFixed(this.precision);
        } else if (this.measureunit.includes("frac")) {
            if(this.denominator) {
                numerator = Math.round((degree_val/180)*this.denominator);
                converted_val = numerator + "/"+this.denominator;
            } else {
                frac = this.reduceDegreesToFrac(degree_val);
                converted_val = frac[0]+"/"+frac[1];
            }
        }

        return converted_val;
    }

    this.convertToDegrees = function(nondeg_val) {
        
        if(this.measureunit.includes("rad")) {
            converted_val = Math.round(nondeg_val.toInt()*180/Math.PI);
        } else if (this.measureunit.includes("frac")) {
            frac_index = nondeg_val.search("/");
            temp_numerator = nondeg_val.slice(0,frac_index).toInt();
            temp_denom = nondeg_val.slice(frac_index+1).toInt();
            converted_val = Math.round((temp_numerator/temp_denom)*180/Math.PI);
        }

        return converted_val;
    }

    this.reduceDegreesToFrac = function (degree) {
        // Provides the radian fraction as an object with numerator = [0], denom = [1]
        // reduce() source: https://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
        // I really should know this.
        function reduce(numerator, denominator) {
            var gcd = function gcd(a, b) {
                return b ? gcd(b, a % b) : a;
            };
            gcd = gcd(numerator, denominator);
            return [numerator / gcd, denominator / gcd];
        }

        return reduce(degree, 180);
    }

    /* Snapping helpers for when snapping is turned on */

    this.setSnaps = function () {
        for (i = 0; i <= 180; i += this.interval) {
            this.snaps.push(i);
        }
    }

    this.setRadSnaps = function () {
        for (i = 0; i <= 180; i += this.interval/4) {
            this.radsnaps.push(i);
        }
    }

    this.getClosestSnap = function (coord, rad = false) {
        // rad parameter lets you use the radian snapping function, which is like normal snapping with 4 subdivisions
        // between every tick mark.
        var curAngle = this.calcAngle(coord);
        var index;

        if(rad) {
            index = this.radsnaps.findIndex(function (currentValue) {
                if (curAngle <= currentValue) {
                    return true;
                }
            });
        } else {
            index = this.snaps.findIndex(function (currentValue) {
                if (curAngle <= currentValue) {
                    return true;
                }
            });
        }

        var botSnap;
        var topSnap;

        if(rad) {
            botSnap = this.radsnaps[index - 1];
            topSnap = this.radsnaps[index];
        } else {
            botSnap = this.snaps[index - 1];
            topSnap = this.snaps[index];
        }
        

        if ((topSnap - curAngle) >= (curAngle - botSnap)) {
            return this.getPointFromAnglitude(botSnap, this.magnitude);
        } else {
            return this.getPointFromAnglitude(topSnap, this.magnitude);
        }

    }

    /*************** Ray/Point Control ***************/
    /**
    * Methods that allow for user hiding, showing, locking, and unlocking groups of points.
    * Passing no input in CTAT results in points_list as an empty string (falsy), and 
    * this results in locking/unlocking/hiding/showing ALL possible points in the protractor
    */


    this.lockPoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if(points_list.includes(value.name) || !points_list) {
                value.deactivateProtRay();
            } else {
                value.reactivateProtRay();
            }
        });
    }

    this.unlockPoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if(points_list.includes(value.name) || !points_list) {
                value.reactivateProtRay();
            }
        });
    }

    this.hidePoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if((points_list.includes(value.name) || !points_list) && !value.hidden) {
                value.hideProtRay();
            }
        });
    }

    this.showPoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if((points_list.includes(value.name) || !points_list) && value.hidden) {
                value.showProtRay();
            }
        });
    }

    this.fadeOutPoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if((points_list.includes(value.name) || !points_list) && !value.hidden) {
                value.fadeOutProtRay();
            }
        });
    }

    this.fadeInPoints = function (points_list) {
        Object.values(this.interactivePoints).forEach(function(value) {
            if((points_list.includes(value.name) || !points_list) && value.hidden) {
                value.fadeInProtRay();
            }
        });
    }


    /*************** Correct/Incorrect Highlighting ***************/
    /**
    * Determines which protrays to highlight when correct/incorrect values received
    */
    //TODO need to handle non-highlighting input for tutor-performed actions

    this.showCorrect = function (aSAI) {
        var inp = aSAI.getInput();
        var action = aSAI.getAction();
        var correct_baseray;
        var correct_selectedRay;

        switch (action) {
            case "setAngle":

                if(this.chosen) {
                    correct_selectedRay = this.findProtray(this.chosenAngle.charAt(0));
                    correct_baseray = this.findProtray(this.chosenAngle.charAt(2));
                } else {
                    showcorrect_angles = JSON.parse("{"+inp+"}");
                    correct_selectedRay = this.findProtray(Object.keys(showcorrect_angles)[0][0]);
                    correct_baseray = this.findProtray(Object.keys(showcorrect_angles)[0][2]);

                }
                correct_selectedRay.styleCorrect();
                correct_baseray.styleCorrect();
                break;
            default: console.log("Correct highlights not functioning properly."); break;
        }

    }

    this.showInCorrect = function (aSAI) {
        var inp = aSAI.getInput();
        var action = aSAI.getAction();
        var incorrect_selectedRay;

        switch (action) {
            case "setAngle":

                if(this.chosen) {
                    incorrect_selectedRay = this.findProtray(this.chosenAngle.charAt(0));
                } else {
                    showincorrect_angles = JSON.parse("{"+inp+"}");
                    incorrect_selectedRay = this.findProtray(Object.keys(showincorrect_angles)[0][0]);
                }
                incorrect_selectedRay.styleIncorrect();
                break;
            default: console.log("Incorrect highlights not functioning properly."); break;
        }

    }

    this.showHintHighlight = function (p_show, aSAI) {
        if (aSAI) {
            var inp = aSAI.getInput();
            var action = aSAI.getAction();
        }
        var baseray;
        var hint_selectedRay;

        switch (action) {
            case "setAngle":
                //If only a number is passed, it will assume angle ABC.
                if(this.chosen) {
                    hint_selectedRay = this.findProtray(this.chosenAngle.charAt(0));
                    baseray = this.findProtray(this.chosenAngle.charAt(2));
                } else {
                    showhint_angles = JSON.parse("{"+inp+"}");
                    hint_selectedRay = this.findProtray(Object.keys(showhint_angles)[0][0]);
                    baseray = this.findProtray(Object.keys(showhint_angles)[0][2]);
                }

                hint_selectedRay.styleHint();
                baseray.styleHint();
                break;
            default: //console.log("Hint's broke son.  Or maybe not; hint unhighlighting triggers this error msg."); 
                break;
        }

    }




};

// Set up inheritance.
// set the protractor prototype to an instance of the superclass prototype
CTATProtractor.prototype = Object.create(CTAT.Component.Base.SVG.prototype);
CTATProtractor.prototype.constructor = CTATProtractor;

// Register the component: the first argument is the string used in the
// class attribute of the div to indicate the type of component, the
// second argument is the function defined above.
CTAT.ComponentRegistry.addComponentType('CTATProtractor', CTATProtractor);


/*************** Correctness Checking in Tutor ***************/
/**
* For complex protractors (with more than two interactive/base points), SAI inputs will be near-JSON 
* strings that require more complex processing to determine if the student successfully moved a ray to
* the correct angle.  These functions can be used in the "Input" line of "Matcher Settings" in CTAT brds, 
* and they will return the needed boolean value (matcher must be set to boolean!)
*/

// function checkProtractorInputRange(angleName, lower, upper, input) {
//     inp = JSON.parse("{"+input+"}");
//     inpAngle = Math.abs(inp[angleName]);
  
//     return (inpAngle >= lower && inpAngle <= upper);
//   }
  
//   function checkProtractorInputRangeLower(angleName, lower, input) {
//     inp = JSON.parse("{"+input+"}");
//     inpAngle = Math.abs(inp[angleName]);
  
//     return (inpAngle < lower);
//   }
  
//   function checkProtractorInputRangeUpper(angleName, upper, input) {
//     inp = JSON.parse("{"+input+"}");
//     inpAngle = Math.abs(inp[angleName]);
  
//     return (inpAngle > upper);
//   }


/*************** Correctness Checking using tutor values ***************/
/**
* These were attempts to allow reporting of protractor values in hint
* messages/when you were asking the learner to report an angle in the protractor
* to a CTATTextInput.  Unfortunately, this results in a stack overflow due
* to CTATShellTools referring to itself in the variable table.
* This bug has to be bypassed somehow for these to work.
*/

// window.onload = function() {
    // trying to short-circuit the problem with this by having it 'bind' as necessary by default, but didn't work like this
//     bug_setter = thisOrOtherProtractor();
//     console.warn("Bug setter trigger?");
//     console.log(bug_setter.reportAngle(bug_setter.interactivePointString.charAt(0)+bug_setter.basePointString.slice(0,2)));
// }

// function thisOrOtherProtractor(otherProtractor = null) {
//     if(otherProtractor != null) {
//         return CTATShellTools.findComponentInstance(otherProtractor);
//     } else {
//         return CTATShellTools.findComponentByClass("CTATProtractor");
//     }
// }


// function checkTextInputRange(angleName, tolerance, input, otherProt = null) {
//     other_protractor = thisOrOtherProtractor(otherProt);
//     var compAngle = other_protractor.reportAngle(angleName);
//     var inp = parseInt(input);

//     var diff = Math.abs(inp - compAngle);

//     return (diff <= tolerance && diff != 0);
// }

// function checkTextInputExact(angleName, input, otherProt = null) {
//     other_protractor = thisOrOtherProtractor(otherProt);
//     var compAngle = other_protractor.reportAngle(angleName);
//     var inp = parseInt(input);

//     return (compAngle === inp);
// }

// function checkTextInputRangeLesser(angleName, tolerance, input, otherProt = null) {
//     other_protractor = thisOrOtherProtractor(otherProt);
//     var compAngle = other_protractor.reportAngle(angleName) - tolerance;
//     var inp = parseInt(input);

//     return (inp < compAngle);
// }

// function checkTextInputRangeGreater(angleName, tolerance, input, otherProt = null) {
//     other_protractor = thisOrOtherProtractor(otherProt);
//     var compAngle = other_protractor.reportAngle(angleName) + tolerance;
//     var inp = parseInt(input);

//     return (inp > compAngle);
// }

// function angleReturner(angleName, otherProt = null) {
//     other_protractor = thisOrOtherProtractor(otherProt);
//     reporting_angle = other_protractor.reportAngle(angleName);
//     if(typeof reporting_angle == "number") {
//         reporting_angle = Math.round(reporting_angle);
//     }
//     return reporting_angle;  
// }