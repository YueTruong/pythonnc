from flask import Flask, render_template, request, redirect, url_for, flash, session
import psycopg2
from psycopg2 import sql

app = Flask(__name__)
app.secret_key = "your_secret_key"

#Thiết lập kết nối với database
DB_CONFIG = {
    'dbname': 'lego',
    'user': 'postgres',
    'password': '123456',
    'host': 'localhost',
    'port': '5432'
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

#Login Route
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == DB_CONFIG['user'] and password == DB_CONFIG['password']:
            session['logged_in'] = True
            return redirect(url_for('loading'))
        else:
            return render_template('login.html', title='Login', error=True)
    return render_template('login.html', title='Login', error=False)

#Loading screen
@app.route('/loading')
def loading():
    if 'logged_in' not in session:
        return redirect(url_for('login'))
    return render_template('loading.html', title='Loading')

#Main Application Route
@app.route('/main', methods=['GET', 'POST'])
def main():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    connection = get_db_connection()
    cursor = connection.cursor()

    #Thêm theme
    if request.method == 'POST' and 'new_theme' in request.form:
        new_theme = request.form['new_theme']
        try:
            cursor.execute(sql.SQL("INSERT INTO themes (theme) VALUES (%s)"), [new_theme])
            connection.commit()
            flash("Theme added successfully!", "success")
        except Exception as e:
            connection.rollback()
            flash(f"Error adding theme: {e}", "danger")

    #Lấy dữ liệu từ themes và legoset để hiển thị
    cursor.execute("SELECT row_number() OVER () as id, theme FROM themes ORDER BY theme ASC")
    themes = cursor.fetchall()

    cursor.execute("SELECT id, theme, name FROM legoset ORDER BY id ASC")
    lego_sets = cursor.fetchall()

    connection.close()

    return render_template(
        'main.html',
        themes=themes,
        lego_sets=lego_sets,
        title='Lego Store Management'
    )

@app.route('/theme/edit', methods=['POST'])
def edit_theme():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    theme_id = request.form['theme_id']
    theme_name = request.form['theme_name']

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("UPDATE themes SET theme = %s WHERE theme = %s", (theme_name, theme_id))
        connection.commit()
        flash("Theme updated successfully!", "success")
    except Exception as e:
        connection.rollback()
        flash(f"Error editing theme: {e}", "danger")
    connection.close()
    return redirect(url_for('main'))

@app.route('/theme/delete/<theme>')
def delete_theme(theme):
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM themes WHERE theme = %s", (theme,))
        connection.commit()
        flash("Theme deleted successfully!", "success")
    except Exception as e:
        connection.rollback()
        flash(f"Error deleting theme: {e}", "danger")
    connection.close()
    return redirect(url_for('main'))

@app.route('/insert_lego', methods=['POST'])
def insert_lego():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    lego_id = request.form['lego_id']
    lego_theme = request.form['lego_theme']
    lego_name = request.form['lego_name']

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            sql.SQL("INSERT INTO legoset (id, theme, name) VALUES (%s, %s, %s)"),
            [lego_id, lego_theme, lego_name]
        )
        connection.commit()
        flash("Lego set added successfully!", "success")
    except Exception as e:
        connection.rollback()
        flash(f"Error adding Lego set: {e}", "danger")
    finally:
        connection.close()

    return redirect(url_for('main'))

@app.route('/lego/edit', methods=['POST'])
def edit_lego():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    lego_id = request.form['lego_id']
    lego_theme = request.form['lego_theme']
    lego_name = request.form['lego_name']

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE legoset SET theme = %s, name = %s WHERE id = %s",
            (lego_theme, lego_name, lego_id)
        )
        connection.commit()
        cursor.close()
        flash("Lego set updated successfully!", "success")
    except Exception as e:
        connection.rollback()
        flash(f"Error editing Lego set: {e}", "danger")
    connection.close()
    return redirect(url_for('main'))

@app.route('/lego/delete/<int:id>')
def delete_lego(id):
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM legoset WHERE id = %s", (id,))
        connection.commit()
        flash("Lego set deleted successfully!", "success")
    except Exception as e:
        connection.rollback()
        flash(f"Error deleting Lego set: {e}", "danger")
    connection.close()
    return redirect(url_for('main'))

@app.route('/find_lego', methods=['GET'])
def find_lego():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    query = request.args.get('query', '').strip()

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        if query.isdigit():  #Nếu truy vấn là số thì tìm theo id
            cursor.execute("""
                SELECT id, theme, name 
                FROM legoset 
                WHERE id = %s
                ORDER BY id ASC
            """, (query,))
        else:  #Không thì tìm theo chủ đề hoặc tên
            cursor.execute("""
                SELECT id, theme, name 
                FROM legoset 
                WHERE LOWER(theme) LIKE LOWER(%s) OR LOWER(name) LIKE LOWER(%s)
                ORDER BY id ASC
            """, (f"%{query}%", f"%{query}%"))
        
        lego_sets = cursor.fetchall()

        cursor.execute("SELECT row_number() OVER () as id, theme FROM themes ORDER BY theme ASC")
        themes = cursor.fetchall()
    except Exception as e:
        flash(f"Error searching Lego sets: {e}", "danger")
        lego_sets = []
        themes = []
    finally:
        connection.close()

    return render_template(
        'main.html',
        lego_sets=lego_sets,
        themes=themes,
        title='Lego Store Management'
    )

#Logout
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)