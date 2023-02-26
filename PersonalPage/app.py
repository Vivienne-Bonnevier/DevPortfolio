##===================================================================================================##
from flask import Flask, render_template, session, redirect, url_for
import os
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, EmailField, SubmitField
from wtforms.validators import DataRequired, Length, Email
from dotenv import load_dotenv
##===================================================================================================##
app=Flask(__name__)
load_dotenv("secret.env")

basedir = os.path.abspath(os.path.dirname(__file__))

app.config["SQLALCHEMY_DATABASE_URI"] =\
 "sqlite:///" + os.path.join(basedir, "data.sqlite")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"]= os.environ.get("SECRET_KEY")

db = SQLAlchemy(app)
##===================================================================================================##
##this form renders in HTML and can take in information and, with code below, store it to the database Messages.
class Form(FlaskForm):
    name = StringField("Name:",  [DataRequired(), Length(min=2, max=100)])
    email = EmailField("Email:", [DataRequired(), Email()])
    message = TextAreaField("Message:", [DataRequired()])
    submit = SubmitField("Submit")

##table class that stores name, email, and message for the SQLAlchemy database.
class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    email = db.Column(db.String(64))
    message = db.Column(db.Text)

##===================================================================================================##
@app.route('/')
def home():
    return render_template("home.html")

@app.route('/contact', methods=["GET", "POST"])
def contact():
    name=None
    email=None
    message=None
    results = Messages.query.all()
    form = Form()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        message = form.message.data
        m = Messages(name=name, email=email, message=message)
        db.session.add(m)
        db.session.commit()
        results = Messages.query.all()
        form.name.data = ""
        form.email.data = ""
        form.message.data = ""
        return redirect(url_for("contact"))
    return render_template("contact.html", form=form, name=name, email=email, message=message, results=results)

@app.route('/fundamentals')
def fundamentals():
    return render_template("learned.html")

@app.route('/resume')
def resume():
    return render_template("resume.html")

@app.route('/getdb')
def getdb():
    results = Messages.query.all()
    return render_template("getdb.html", results=results)
##===================================================================================================##
if __name__ == "__main__":
    app.run(debug=True)