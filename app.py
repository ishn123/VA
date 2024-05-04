import time

import pyttsx3
import threading
from flask import Flask, request, jsonify, redirect, url_for,render_template
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import spacy
import os





app = Flask(__name__)



# Initialize pyttsx3 speech engine in a separate thread
def initialize_engine():
    global engine
    engine = pyttsx3.init()


# Function to speak the given text
def speak_text(text):
    engine.say(text)
    engine.runAndWait()


# Function to search for products on Amazon using Selenium
def search_amazon(products):
    options = webdriver.ChromeOptions()
    #options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    driver.get('https://www.amazon.com')
    time.sleep(60)
    for product in products:
        search_box = driver.find_element(by=By.ID,value='twotabsearchtextbox')
        search_box.clear()
        search_box.send_keys(product)
        search_box.send_keys(Keys.RETURN)

        # Extract search results (you can refine this logic based on your requirements)
        results = driver.find_element(by=By.CSS_SELECTOR,value='.s-result-item')
        product_names = [result.find_element_by_css_selector('.a-size-medium').text for result in results]
        print("Search results for", product, ":", product_names)


    driver.quit()
    #return product_names


# Function to add product to cart on Amazon using Selenium
def add_to_cart(product):
    # options = webdriver.ChromeOptions()
    # options.add_argument('--headless')  # Run browser in background
    # driver = webdriver.Chrome(options=options)
    #driver.get('https://www.amazon.com')

    # search_box = driver.find_element(by=By.ID,value='twotabsearchtextbox')
    # search_box.clear()
    # search_box.send_keys(product)
    # search_box.send_keys(Keys.RETURN)

    # Find and click on the first search result
    first_result = driver.find_element(by=By.CSS_SELECTOR,value='.s-result-item')
    first_result.click()

    # Add the product to cart (you may need to adjust this based on the specific page layout)
    add_to_cart_button = driver.find_element(by=By.ID,value='add-to-cart-button')
    add_to_cart_button.click()

    driver.quit()


# Function to handle voice command processing
def process_voice_command(voice_text):
    # Load spaCy model
    nlp = spacy.load("en_core_web_sm")

    # Convert voice text to lowercase for easier processing
    voice_text = voice_text.lower()

    # Extract product names using spaCy
    doc = nlp(voice_text)
    products = [token.text for token in doc if token.pos_ == "NOUN"]
    print(products)
    if 'search' in voice_text:
        # Search for products on Amazon
        search_results = search_amazon(products)

        # Speak the search results
        speak_text("Here are the search results on Amazon:")
        for i, product in enumerate(search_results, start=1):
            speak_text(f"{i}. {product}")

    elif 'add to cart' in voice_text:
        # Add the product to cart
        add_to_cart(products[0])  # Assuming the first noun is the product name
        speak_text(f"{products[0]} added to cart.")

    elif 'checkout' in voice_text:
        # Proceed to checkout
        speak_text("Proceeding to checkout.")
        # Here, you can implement logic for the checkout process (e.g., redirect to payment page)
        return redirect("https://www.amazon.com/cart", code=302)

    else:
        # Unknown command
        speak_text("Sorry, I didn't understand that.")

        return 501

    return


@app.route('/')
def index():

    speak_text("Hey how can I help")
    return render_template('index.html')

# Route for processing voice command
@app.route('/process_voice', methods=['POST'])
def process_voice_command_route():
    data = request.json
    voice_text = data['text']

    # Process the voice command text
    res = process_voice_command(voice_text)

    # For demonstration, return a success message
    if res == 501:
        return jsonify({'message':'stop reco'})
    return jsonify({'message': 'Voice command processed successfully'})

engine_thread = threading.Thread(target=initialize_engine)
engine_thread.start()
    # Wait for pyttsx3 engine initialization thread to complete
engine_thread.join()
#d
if __name__ == "__main__":


    app.run(debug=True,port=3000)
