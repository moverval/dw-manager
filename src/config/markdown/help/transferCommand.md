**Transfer Command**

Mit dem Transfer Befehl können festgelegte Mengen an Geld von einem Account auf einen anderen übertragen werden.

Schreibweise:
```
$prefix;transfer <@mention> <amount>
```

Beispiel:

Dieses Beispiel erstellt eine Anfrage, 100 Münzen an den Nutzer $randomUsername; zu überweisen
```
$prefix;transfer $randomMention; 100
```

**Bestätigung**

Nachdem der Nutzer der Menge festgelegt hat wird eine Nachfrage vom Bot erstellt die bestätigt werden muss.
Falls sie abgelehnt wird, wird kein Geld vom Sender abgebucht. Wenn die Nachfrage angenommen wurde kann die Überweisung
automatisch nicht mehr rückgängig gemacht werden.

Nach einer Minute Inaktivität wird die Nachfrage automatisch abgelehnt. Bei einer Ablehnung muss eine neue Transaktion erstellt
werden um eine Geldmenge zu überweisen.
