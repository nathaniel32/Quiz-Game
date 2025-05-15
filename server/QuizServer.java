import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.Map;
import java.util.HashMap;

public class QuizServer {

    private static Map<Integer, String> data = new HashMap<>();
    public static final String SERVER_IP = "0.0.0.0";
    public static final int SERVRT_PORT = 8000;

    public static void main(String[] args) throws Exception {
        // Dummy data
        /* data.put(1, "{"+
                            "\"name\": \"Biologie\", "+
                            "\"type\": null, "+
                            "\"data\": ["+
                                "{"+
                                    "\"a\": \"Welches Organ im menschlichen Koerper produziert Insulin?\", "+
                                    "\"l\": ["+
                                        "\"Leber\", "+
                                        "\"Niere\", "+
                                        "\"Bauchspeicheldruese\", "+
                                        "\"Gehirn\""+
                                    "], "+
                                    "\"r\": 2 "+
                                "}, "+
                                "{"+
                                    "\"a\": \"Was ist die kleinste Einheit des Lebens?\", "+
                                    "\"l\": ["+
                                        "\"Zelle\", "+
                                        "\"Molekuel\", "+
                                        "\"Atom\", "+
                                        "\"Organismus\""+
                                    "], "+
                                    "\"r\": 0 "+
                                "}"+
                            "]"+
                        "}"); */
        data.put(1, "{\"name\":\"Biologie\",\"type\":null,\"data\":[{\"a\":\"Welches ist die kleinste Einheit des Lebens?\",\"l\":[\"Zelle\",\"Molek\\u00fcl\",\"Atom\",\"Organismus\"],\"r\":0},{\"a\":\"Welches ist das gr\\u00f6\\u00dfte Organ des menschlichen K\\u00f6rpers?\",\"l\":[\"Leber\",\"Gehirn\",\"Haut\",\"Herz\"],\"r\":2},{\"a\":\"Welche Art von Zellen produziert Insulin im K\\u00f6rper?\",\"l\":[\"Leberzellen\",\"Bauchspeicheldr\\u00fcsenzellen\",\"Nervenzellen\",\"Muskelzellen\"],\"r\":1},{\"a\":\"Welches Hormon wird von der Schilddr\\u00fcse produziert?\",\"l\":[\"Insulin\",\"\\u00d6strogen\",\"Testosteron\",\"Thyroxin\"],\"r\":3},{\"a\":\"Welches Organ ist f\\u00fcr die Blutreinigung im K\\u00f6rper verantwortlich?\",\"l\":[\"Herz\",\"Leber\",\"Nieren\",\"Milz\"],\"r\":2}]}");
        data.put(2, "{\"name\":\"Geschichte\",\"type\":null,\"data\":[{\"a\":\"Wann fiel die Berliner Mauer?\",\"l\":[\"1961\",\"1989\",\"1945\",\"1991\"],\"r\":1},{\"a\":\"Wer war der erste Pr\\u00e4sident der Vereinigten Staaten?\",\"l\":[\"George Washington\",\"Thomas Jefferson\",\"Abraham Lincoln\",\"John Adams\"],\"r\":0},{\"a\":\"Welches Ereignis l\\u00f6ste den Ersten Weltkrieg aus?\",\"l\":[\"Der Fall der Berliner Mauer\",\"Der Angriff auf Pearl Harbor\",\"Die Ermordung von Franz Ferdinand\",\"Die Schlacht von Stalingrad\"],\"r\":2},{\"a\":\"Wer war der erste Mensch, der den Mond betrat?\",\"l\":[\"Neil Armstrong\",\"Yuri Gagarin\",\"Buzz Aldrin\",\"Alan Shepard\"],\"r\":0},{\"a\":\"Wann wurde die Magna Carta unterzeichnet?\",\"l\":[\"1215\",\"1492\",\"1776\",\"1914\"],\"r\":0}]}");
        data.put(3, "{\"name\":\"Chemie\",\"type\":null,\"data\":[{\"a\":\"Was ist die chemische Formel f\\u00fcr Wasser?\",\"l\":[\"H2O\",\"CO2\",\"NaCl\",\"CH4\"],\"r\":0},{\"a\":\"Was ist die chemische Bezeichnung f\\u00fcr Salz?\",\"l\":[\"NaCl\",\"H2O\",\"CO2\",\"HCl\"],\"r\":0},{\"a\":\"Was ist die h\\u00e4ufigste Element im Erdmantel?\",\"l\":[\"Eisen\",\"Sauerstoff\",\"Silizium\",\"Kohlenstoff\"],\"r\":2},{\"a\":\"Welches Element hat die h\\u00f6chste Ordnungszahl im Periodensystem?\",\"l\":[\"Kohlenstoff\",\"Wasserstoff\",\"Uran\",\"Oganesson\"],\"r\":3},{\"a\":\"Was ist die chemische Formel f\\u00fcr Kohlendioxid?\",\"l\":[\"CO2\",\"H2O\",\"NaCl\",\"CH4\"],\"r\":0}]}");
        data.put(4, "{\"name\":\"Informatik\",\"type\":null,\"data\":[{\"a\":\"Was ist ein Betriebssystem?\",\"l\":[\"Eine Hardware-Komponente\",\"Eine Software, die Hardware-Ressourcen verwaltet\",\"Ein Peripherieger\\u00e4t\",\"Ein Internetprotokoll\"],\"r\":1},{\"a\":\"Was ist ein Algorithmus?\",\"l\":[\"Eine Dateiendung\",\"Eine Programmiersprache\",\"Ein L\\u00f6sungsweg f\\u00fcr ein Problem in Form von Anweisungen\",\"Ein grafisches Benutzeroberfl\\u00e4che\"],\"r\":2},{\"a\":\"Was ist eine Schleife in der Programmierung?\",\"l\":[\"Ein Fehler im Code\",\"Eine Art von Variablen\",\"Ein Programmierwerkzeug\",\"Eine Anweisung, die wiederholt ausgef\\u00fchrt wird\"],\"r\":3},{\"a\":\"Welche Sprache wird h\\u00e4ufig f\\u00fcr die Webentwicklung verwendet?\",\"l\":[\"Java\",\"Python\",\"HTML\",\"C++\"],\"r\":2},{\"a\":\"Was ist ein Array in der Programmierung?\",\"l\":[\"Ein St\\u00fcck Hardware\",\"Ein Art von Datenstruktur, die mehrere Elemente desselben Typs speichert\",\"Ein digitales Speicherger\\u00e4t\",\"Ein Eingabe-\\/Ausgabeger\\u00e4t\"],\"r\":1}]}");
        data.put(5, "{\"name\":\"Recht\",\"type\":null,\"data\":[{\"a\":\"Was ist das h\\u00f6chste Gericht in den Vereinigten Staaten?\",\"l\":[\"Oberstes Gerichtshof\",\"Bundesverfassungsgericht\",\"Europ\\u00e4ischer Gerichtshof\",\"Bundesgerichtshof\"],\"r\":0},{\"a\":\"Was bedeutet der Grundsatz \'Im Zweifel f\\u00fcr den Angeklagten\'?\",\"l\":[\"Der Angeklagte ist immer schuldig\",\"Der Angeklagte ist immer unschuldig\",\"Bei Zweifeln sollte das Gericht f\\u00fcr den Angeklagten entscheiden\",\"Der Angeklagte hat keine Rechte\"],\"r\":2},{\"a\":\"Was ist ein Strafbefehl?\",\"l\":[\"Ein rechtliches Dokument, das die Eheschlie\\u00dfung regelt\",\"Ein Verfahren zur Anerkennung einer Schuld ohne Gerichtsverhandlung\",\"Eine Vereinbarung zwischen zwei Parteien in einem Zivilprozess\",\"Ein Schriftst\\u00fcck, das das Ende eines Gerichtsverfahrens verk\\u00fcndet\"],\"r\":1},{\"a\":\"Was ist die Funktion eines Anwalts?\",\"l\":[\"Die Durchf\\u00fchrung von Operationen\",\"Die Vertretung von Parteien vor Gericht\",\"Die Analyse von wissenschaftlichen Daten\",\"Die Leitung von Unternehmen\"],\"r\":1},{\"a\":\"Was bedeutet der Begriff \'juristische Person\'?\",\"l\":[\"Eine nat\\u00fcrliche Person, die das Recht hat, einen Vertrag abzuschlie\\u00dfen\",\"Eine Person, die im rechtlichen Sinne nicht existiert\",\"Eine Firma oder Organisation, die Rechte und Pflichten hat\",\"Eine Person, die keine Rechte hat\"],\"r\":2}]}");
        data.put(6, "{\"name\":\"Ingenieurwesen\",\"type\":null,\"data\":[{\"a\":\"Was ist eine wichtige Eigenschaft von Werkstoffen in der Mechanik?\",\"l\":[\"Dichte\",\"Viskosit\\u00e4t\",\"Widerstand\",\"Festigkeit\"],\"r\":3},{\"a\":\"Was ist die Rolle eines Schaltplans in der Elektrotechnik?\",\"l\":[\"Erkl\\u00e4ren, wie ein Ger\\u00e4t funktioniert\",\"Eine visuelle Darstellung eines elektrischen Systems\",\"Eine Software zur Berechnung von Schaltkreisen\",\"Die Darstellung von Materialien in einem Bauwerk\"],\"r\":1},{\"a\":\"Was ist der Zweck eines Prototyps in der Produktentwicklung?\",\"l\":[\"Ein Modell, das die endg\\u00fcltige Version eines Produkts darstellt\",\"Ein Testger\\u00e4t f\\u00fcr den Endverbraucher\",\"Eine digitale Simulation eines Produkts\",\"Eine fr\\u00fche Version eines Produkts, die zur Bewertung und Verbesserung dient\"],\"r\":3},{\"a\":\"Was ist die Bedeutung von CAD in der Ingenieurwissenschaft?\",\"l\":[\"Computer-Aided Design\",\"Centralized Air Distribution\",\"Controlled Automation Development\",\"Carbon Alloy Division\"],\"r\":0},{\"a\":\"Was ist eine wichtige Gr\\u00f6\\u00dfe in der Thermodynamik?\",\"l\":[\"Spannung\",\"Entropie\",\"Widerstand\",\"Reibung\"],\"r\":1}]}");
        data.put(7, "{\"name\":\"K\\u00fcnstliche Intelligenz\",\"type\":null,\"data\":[{\"a\":\"Was ist k\\u00fcnstliche Intelligenz?\",\"l\":[\"Eine Software, die menschliche Intelligenz nachahmt\",\"Ein Roboter, der wie ein Mensch aussieht\",\"Ein Algorithmus, der nur von Menschen erstellt werden kann\",\"Eine Simulation des menschlichen Gehirns\"],\"r\":0},{\"a\":\"Welche Art von Netzwerk wird h\\u00e4ufig f\\u00fcr Deep Learning verwendet?\",\"l\":[\"Knotennetzwerk\",\"Fibernetzwerk\",\"K\\u00fcnstliches neuronales Netzwerk\",\"Drahtloses Netzwerk\"],\"r\":2},{\"a\":\"Was ist ein neuronales Netzwerk?\",\"l\":[\"Eine Gruppe von Gehirnzellen\",\"Ein Netzwerk von Computern\",\"Ein Algorithmus, der menschliche Intelligenz nachahmt\",\"Ein Computerprogramm, das aus miteinander verbundenen Neuronen besteht\"],\"r\":3},{\"a\":\"Was ist ein Chatbot?\",\"l\":[\"Ein Roboter, der Fu\\u00dfball spielt\",\"Eine Software, die menschliche Sprache versteht und darauf reagiert\",\"Ein Programm zum Zeichnen von Diagrammen\",\"Ein Algorithmus zur Bilderkennung\"],\"r\":1},{\"a\":\"Was ist Reinforcement Learning?\",\"l\":[\"Eine Methode zur Verbesserung von Teppichen\",\"Eine Methode des maschinellen Lernens, bei der ein Agent durch Belohnungen und Bestrafungen lernt\",\"Ein Verfahren zur Datenverschl\\u00fcsselung\",\"Eine Technik zur Erstellung von 3D-Modellen\"],\"r\":1}]}");
        data.put(8, "{\"name\":\"Wirtschaft\",\"type\":null,\"data\":[{\"a\":\"Was versteht man unter Inflation?\",\"l\":[\"Ein R\\u00fcckgang des allgemeinen Preisniveaus\",\"Ein Anstieg des allgemeinen Preisniveaus\",\"Ein stabiler Zustand des Preisniveaus\",\"Eine einmalige Erh\\u00f6hung der Preise\"],\"r\":1},{\"a\":\"Was ist das Bruttoinlandsprodukt (BIP)?\",\"l\":[\"Der Gesamtwert der Exporte eines Landes\",\"Der Gesamtwert der Importe eines Landes\",\"Der Gesamtwert aller in einem Land hergestellten Waren und Dienstleistungen\",\"Der Wert der Aktien eines Landes\"],\"r\":2},{\"a\":\"Was ist die Hauptaufgabe einer Zentralbank?\",\"l\":[\"Verwaltung von Steuereinnahmen\",\"Kontrolle der Geldmenge und Stabilisierung der W\\u00e4hrung\",\"Festlegung der Preise f\\u00fcr Konsumg\\u00fcter\",\"Bereitstellung von Krediten f\\u00fcr Privatpersonen\"],\"r\":1},{\"a\":\"Was ist eine Rezession?\",\"l\":[\"Eine Periode schnellen Wirtschaftswachstums\",\"Eine Periode von zwei aufeinanderfolgenden Quartalen mit negativem Wirtschaftswachstum\",\"Ein Anstieg der Arbeitslosigkeit um 50%\",\"Eine Phase steigender Inflation\"],\"r\":1},{\"a\":\"Was versteht man unter Angebot und Nachfrage?\",\"l\":[\"Das Verh\\u00e4ltnis zwischen den Produktionskosten und den Verkaufspreisen\",\"Der Zusammenhang zwischen der Menge eines Produkts und dem Preis, den K\\u00e4ufer daf\\u00fcr zu zahlen bereit sind\",\"Die Anzahl der Arbeitskr\\u00e4fte auf dem Markt\",\"Der Vergleich von Importen und Exporten\"],\"r\":1}]}");
        data.put(9, "{\"name\":\"Physik\",\"type\":null,\"data\":[{\"a\":\"Was ist die Einheit der Kraft?\",\"l\":[\"Newton\",\"Joule\",\"Watt\",\"Pascal\"],\"r\":0},{\"a\":\"Was ist das dritte Newtonsche Gesetz?\",\"l\":[\"Jede Wirkung hat eine gleich gro\\u00dfe und entgegengesetzte Reaktion\",\"Kraft ist gleich Masse mal Beschleunigung\",\"Die Beschleunigung ist proportional zur resultierenden Kraft\",\"Die Gravitation ist invers proportional zum Quadrat der Entfernung\"],\"r\":0},{\"a\":\"Was ist die Lichtgeschwindigkeit im Vakuum?\",\"l\":[\"3,00 x 10^8 m\\/s\",\"1,50 x 10^8 m\\/s\",\"3,00 x 10^6 m\\/s\",\"1,50 x 10^6 m\\/s\"],\"r\":0},{\"a\":\"Was ist die Einheit der elektrischen Ladung?\",\"l\":[\"Volt\",\"Ampere\",\"Coulomb\",\"Ohm\"],\"r\":2},{\"a\":\"Was beschreibt das Ohmsche Gesetz?\",\"l\":[\"Der Widerstand ist gleich Spannung mal Stromst\\u00e4rke\",\"Die Spannung ist gleich Stromst\\u00e4rke mal Widerstand\",\"Der Strom ist gleich Spannung mal Widerstand\",\"Die Leistung ist gleich Spannung mal Stromst\\u00e4rke\"],\"r\":1},{\"a\":\"Welche Teilchen sind im Atomkern zu finden?\",\"l\":[\"Elektronen und Neutronen\",\"Protonen und Neutronen\",\"Elektronen und Protonen\",\"Elektronen, Protonen und Neutronen\"],\"r\":1},{\"a\":\"Was ist die Gravitationskonstante (G)?\",\"l\":[\"6,67 x 10^-11 N m^2\\/kg^2\",\"9,81 m\\/s^2\",\"3,00 x 10^8 m\\/s\",\"1,60 x 10^-19 C\"],\"r\":0},{\"a\":\"Was ist das Prinzip der Erhaltung der Energie?\",\"l\":[\"Energie kann weder erzeugt noch vernichtet werden, sondern nur von einer Form in eine andere umgewandelt werden\",\"Energie kann nur in einer Richtung flie\\u00dfen\",\"Energie kann durch Kollision erzeugt werden\",\"Energie kann nur in Masse umgewandelt werden\"],\"r\":0},{\"a\":\"Was ist die Einheit der Arbeit?\",\"l\":[\"Joule\",\"Newton\",\"Watt\",\"Pascal\"],\"r\":0},{\"a\":\"Was beschreibt die Relativit\\u00e4tstheorie?\",\"l\":[\"Die Gesetze der Physik sind in allen Inertialsystemen gleich\",\"Die Lichtgeschwindigkeit ist in allen Inertialsystemen gleich\",\"Die Zeit vergeht in allen Inertialsystemen gleich\",\"Die Masse eines K\\u00f6rpers ist in allen Inertialsystemen gleich\"],\"r\":1}]}");
        data.put(10, "{\"name\":\"JavaScript\",\"type\":null,\"data\":[{\"a\":\"Was ist JavaScript?\",\"l\":[\"Eine serverseitige Programmiersprache\",\"Eine clientseitige Programmiersprache\",\"Eine Datenbankabfragesprache\",\"Ein Betriebssystem\"],\"r\":1},{\"a\":\"Welche Methode wird verwendet, um eine Nachricht in der Konsole anzuzeigen?\",\"l\":[\"console.print()\",\"console.display()\",\"console.log()\",\"console.show()\"],\"r\":2},{\"a\":\"Wie kann man eine Funktion in JavaScript definieren?\",\"l\":[\"function: myFunction()\",\"def myFunction()\",\"function myFunction()\",\"func myFunction()\"],\"r\":2},{\"a\":\"Wie kann man eine Variable in JavaScript deklarieren?\",\"l\":[\"var myVariable;\",\"let myVariable;\",\"const myVariable;\",\"Alle der genannten Optionen\"],\"r\":3},{\"a\":\"Was ist der Zweck von \'use strict\' in JavaScript?\",\"l\":[\"Erm\\u00f6glicht die Verwendung neuer JavaScript-Features\",\"Erzwingt eine striktere Fehlerpr\\u00fcfung und sicherere JavaScript-Ausf\\u00fchrung\",\"Schaltet alle Debugging-Tools aus\",\"Verhindert die Verwendung von globalen Variablen\"],\"r\":1},{\"a\":\"Welches der folgenden ist kein JavaScript-Datentyp?\",\"l\":[\"Number\",\"String\",\"Boolean\",\"Character\"],\"r\":3},{\"a\":\"Wie kann man eine Schleife in JavaScript erstellen?\",\"l\":[\"for (i = 0; i < 5; i++) {}\",\"loop (i = 0; i < 5; i++) {}\",\"while (i = 0; i < 5; i++) {}\",\"repeat (i = 0; i < 5; i++) {}\"],\"r\":0},{\"a\":\"Welche Methode wird verwendet, um ein Element nach ID auszuw\\u00e4hlen?\",\"l\":[\"getElementById()\",\"querySelector()\",\"getElementByClass()\",\"getElementByTag()\"],\"r\":0},{\"a\":\"Was ist eine Callback-Funktion in JavaScript?\",\"l\":[\"Eine Funktion, die als Argument an eine andere Funktion \\u00fcbergeben wird\",\"Eine Funktion, die niemals aufgerufen wird\",\"Eine Funktion, die keine Argumente hat\",\"Eine Funktion, die nur innerhalb von Schleifen verwendet wird\"],\"r\":0},{\"a\":\"Was ist die Ausgabe von \'typeof null\' in JavaScript?\",\"l\":[\"object\",\"null\",\"undefined\",\"string\"],\"r\":0}]}");
        data.put(11, "{\"name\":\"Mathe\",\"type\":1,\"data\":[{\"a\":\"ax^2 + bx + c = 0\",\"l\":[\"x = -b \\u00b1 \\\\sqrt{b^2 - 4ac} \\/ 2a\",\"x = -b \\u2213 \\\\sqrt{b^2 - 4ac} \\/ 2a\",\"x = -b + \\\\sqrt{b^2 - 4ac} \\/ 2a\",\"x = -b - \\\\sqrt{b^2 - 4ac} \\/ 2a\"],\"r\":0},{\"a\":\"f(x) = x^2\",\"l\":[\"f\'(x) = 2x\",\"f\'(x) = x\",\"f\'(x) = 2\",\"f\'(x) = 1\"],\"r\":0},{\"a\":\"e^x\",\"l\":[\"\\u222b e^x dx = e^x + C\",\"\\u222b e^x dx = ln(x) + C\",\"\\u222b e^x dx = sin(x) + C\",\"\\u222b e^x dx = cos(x) + C\"],\"r\":0},{\"a\":\"\\\\sqrt{9}\",\"l\":[\"3\",\"6\",\"9\",\"27\"],\"r\":0},{\"a\":\"f(x) = cos(x)\",\"l\":[\"f\'(x) = sin(x)\",\"f\'(x) = cos(x)\",\"f\'(x) = -sin(x)\",\"f\'(x) = -cos(x)\"],\"r\":2},{\"a\":\"x^3 - 8 = 0\",\"l\":[\"x = 2\",\"x = 4\",\"x = 8\",\"x = -2\"],\"r\":0}]}");
        //data.put(n, "");

        HttpServer server = HttpServer.create(new InetSocketAddress(SERVER_IP, SERVRT_PORT), 0);
        server.createContext("/data", new MyHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server ist gestartet " + SERVER_IP +":"+ SERVRT_PORT);
    }

    static class MyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String requestMethod = exchange.getRequestMethod();
            if (requestMethod.equalsIgnoreCase("GET")) {
                handleGetRequest(exchange);
            }
        }

        private void handleGetRequest(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            String response;
            if (query != null && query.contains("id=")) {
                String[] params = query.split("=");
                int id = Integer.parseInt(params[1]);
                response = data.containsKey(id) ? data.get(id) : "ID nicht gefunden";
            } else {
                response = "Invalid request";
            }

            //headers
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, response.length());

            //output
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
