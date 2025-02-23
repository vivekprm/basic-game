# Movement
Variables that we are going to use, and it ofcourse applies to square, circles, bricks, paddle anything in our little game :
X = x position
Y = y position

V = velocity with which any object is moving.
Vx = Velocity in x direction
Vy = Velocity in y direction

a = acceleration, how fast our object is picking up speed.
ax = acceleration of x
ay = acceleration of y

dt = difference in delta between frame.

Think of two points on a line (x1, y1) and (x2, y2) diff between these two points along the line in delta.

Now let's talk about our model movement.

Vx = ax * dt
Vy = ay * dt

Once we have our velocities calculated we are going to get our positions.
X = Vx * dt
Y = Vy * dt