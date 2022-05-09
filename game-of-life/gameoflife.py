#Configurables

screen_width = 1080;
screen_height = 720;

cell_size = 10;

delta_time = 0.01;

density = 0.5;

bg_color_rgb_i = [30, 203, 225];
color_rgb_i = [225, 52, 30];

width = screen_width // cell_size;
height = screen_height // cell_size;

#Initialization
import pyglet;
import random;
import time;

window = pyglet.window.Window(width=screen_width, height=screen_height, caption='Game of life', resizable=True);
points = pyglet.graphics.vertex_list(0, 'v2i', 'c3B');

matrix = [[True for y in range(height)] for x in range(width)];

for x in range(width):
    for y in range(height):
        matrix[x][y] = random.random() >= density;



#Func
def run_rules ():
    global matrix;
    new_matrix = [[True for y in range(height)] for x in range(width)];
    
    for x in range(width):
        for y in range(height):
            nears = get_nears_count(x, y);
            alive = matrix[x][y];
            if alive:
                new_matrix[x][y] = 2 <= nears <= 3;
            else:
                new_matrix[x][y] = nears == 3;
    matrix = new_matrix;
    
    
def get_nears_count (x, y):
    count = 0;
    for _x in range(x-1,x+2):
        for _y in range(y-1,y+2):
            if (_x == x and _y == y):
                continue;
            count += matrix[_x % width][_y % height];
    return count;

def draw_game ():
    window.clear();
    
    pyglet.gl.glClearColor(bg_color_rgb_i[0] / 255, bg_color_rgb_i[1] / 255, bg_color_rgb_i[2] / 255, 1.0);
    
    vertices = []; colors = [];
    
    for x in range(width):
        for y in range(height):
            if (matrix[x][y]):
                add_vertex(x, y, vertices, colors);
    
    points.resize(len(vertices) // 2);
    points.vertices = vertices;
    points.colors = colors;
    
    points.draw(pyglet.gl.GL_QUADS);

def add_vertex (x, y, vertices, colors):
    x1 = x * cell_size; y1 = y * cell_size;
    x2 = x1 + cell_size; y2 = y1 + cell_size;
    
    vertices.extend([x1, y1, x2, y1, x2, y2, x1, y2]);
    colors.extend(color_rgb_i * 4);


#Events
@window.event
def on_draw():
    window.clear();
    draw_game();

def update (dt):
    run_rules();

#Run
if __name__ == '__main__':
    pyglet.clock.schedule_interval(update, delta_time);
    pyglet.app.run();