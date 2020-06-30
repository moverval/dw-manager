Dieser Command wird genutzt um interessante Informationen oder den Syntax über einen anderen Befehl herauszufinden.

**Syntax**
```
$prefix;help <Navigator>
```

**Navigator**
Ein Navigator kann ein einfacher Name, aber auch ein Pfad zu einer bestimmten Erklärung sein.
Um nach Unterthemen eines Befehls zu suchen wird ein **.** (Punkt) verwendet.

Um beispielsweise zu dem Hilfstext des Commands *help* zu kommen wäre diese Schreibweise möglich:
```
$prefix;help help
```

Um nun nach der Nutzung dieses Commands nachzuschlagen kann man den Unterpunkt usage verwenden.
Die korrekte Schreibweise sieht hierzu so aus:
```
$prefix;help help.usage
```

Unterpunkte werden immer nach dem Ende der Beschreibung des Befehls oder des oberen Unterpunkts angezeigt. Es kann also immer durch hinzufügen eines Punktes und des weiteren Unterpunktes in das neue Thema hineinnavigiert werden.
