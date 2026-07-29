import 'package:flutter/material.dart';

import '../data/onboarding_data.dart';


class OnboardingPage extends StatelessWidget {

  final OnboardingItem item;

  const OnboardingPage({
    super.key,
    required this.item,
  });


  @override
  Widget build(BuildContext context) {

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),

      child: Column(

        mainAxisAlignment: MainAxisAlignment.center,

        children: [

          Expanded(

            flex: 5,

            child: Center(

              child: Image.asset(
                item.image,
                width: 280,

                errorBuilder: (
                  context,
                  error,
                  stackTrace,
                ) {

                  return const Icon(
                    Icons.image,
                    size: 120,
                    color: Colors.grey,
                  );

                },
              ),

            ),

          ),


          Expanded(

            flex: 2,

            child: Column(

              children: [

                Text(
                  item.title,

                  textAlign: TextAlign.center,

                  style: const TextStyle(

                    fontSize: 28,

                    fontWeight: FontWeight.bold,

                  ),

                ),


                const SizedBox(height: 20),


                Text(

                  item.description,

                  textAlign: TextAlign.center,

                  style: const TextStyle(

                    fontSize: 16,

                    color: Colors.grey,

                    height: 1.5,

                  ),

                ),

              ],

            ),

          ),

        ],

      ),

    );

  }

}