// Automatic FlutterFlow imports
import '/backend/supabase/supabase.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/custom_code/actions/index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!


import 'package:collection/collection.dart';
import 'package:firebase_core/firebase_core.dart';


import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:awesome_notifications/awesome_notifications.dart';


Future initializeMessaging() async {
  // Add your function code here!
  await Firebase.initializeApp();


  FirebaseMessaging.instance.requestPermission().then((settings) {
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      FirebaseMessaging.instance.getToken().then((token) {
        FFAppState().fcmToken = token ?? "No token";
      });
    } else {
      FFAppState().fcmToken = "No token";
    }
  });


  // Initialize our local notifications
  await AwesomeNotifications().initialize(
    null,
    [
      NotificationChannel(
        channelKey: 'alerts',
        channelName: 'Alerts',
        channelDescription: 'Notification tests as alerts',
        playSound: true,
        onlyAlertOnce: true,
        groupAlertBehavior: GroupAlertBehavior.Children,
        importance: NotificationImportance.High,
        defaultPrivacy: NotificationPrivacy.Private,
        defaultColor: Colors.deepPurple,
        ledColor: Colors.deepPurple,
      )
    ],
    debug: true,
  );


  FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
    print("received message 1: ${message.notification?.title}");


    await AwesomeNotifications().createNotification(
        content: NotificationContent(
            id: -1,
            channelKey: 'alerts',
            title: message.notification?.title ?? "No title",
            body: message.notification?.body ?? "No body",
            payload: {'notificationId': '1234567890'}),
        actionButtons: [
          NotificationActionButton(
            key: "DISMISS",
            label: "Dismiss",
            actionType: ActionType.DismissAction,
            isDangerousOption: true,
          )
        ]);
  });
}
