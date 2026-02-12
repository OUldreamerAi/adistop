This is a chrome exetension which makes you read a random wikibedia page and answer specific questions about to get to websited of your choosing. And since its a random wikibedia article you might need to read for a long time i mean a looooong time. I mean a 100 000 words 200 pages. But even if that would be funny its likey just gona be just a short one. 

##Features, how it works and how to use it?
- First of you gota install it. I explain at the botom.
- When opening the exetension you will see two boxes where yoy can type stuff. You tipe into the first box what websites you want to ban and to the second what you want to unban. The unban takes a hour to take place and does usually not really work, but the banning does work perfectly.
- Now when you open a website you banned it gives you a wikibedia article on top of that websites. The idea is you read the article and then aswer specific questions about the text made by Ai. If you get a big enough part of the questions right yay you can use the website you banned (just dont restart the website) but if you dont get enough questions correct then you gota read a new wikibedia article yay. And yes its a random wikibedia article in english. 

curl https://ai.hackclub.com/proxy/v1/chat/completions \
-H "Authorization: Bearer sk-hc-v1-84642dca3ba74c4e8e92aaada87d84ff83447ce3f33a495b97da9dfe0e4f5d82" \
-H "Content-Type: application/json" \
-d '{"model": "qwen/qwen3-32b", "messages": [{"role": "user", "content": "Hi"}]}'