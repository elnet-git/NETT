import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routes/app_routes.dart';
import '../data/onboarding_data.dart';
import '../widgets/onboarding_page.dart';


class OnboardingScreen extends StatefulWidget {

  const OnboardingScreen({
    super.key,
  });


  @override
  State<OnboardingScreen> createState() =>
      _OnboardingScreenState();

}



class _OnboardingScreenState extends State<OnboardingScreen> {


  final PageController controller = PageController();


  int currentPage = 0;



  void nextPage() {

    if (currentPage < onboardingItems.length - 1) {

      controller.nextPage(

        duration: const Duration(
          milliseconds: 300,
        ),

        curve: Curves.easeInOut,

      );

    } else {

      context.go(
        AppRoutes.login,
      );

    }

  }



  void skip() {

    context.go(
      AppRoutes.login,
    );

  }



  @override
  void dispose() {

    controller.dispose();

    super.dispose();

  }



  @override
  Widget build(BuildContext context) {

    return Scaffold(

      body: SafeArea(

        child: Column(

          children: [


            Expanded(

              child: PageView.builder(

                controller: controller,

                itemCount: onboardingItems.length,


                onPageChanged: (index) {

                  setState(() {

                    currentPage = index;

                  });

                },


                itemBuilder: (context, index) {

                  return OnboardingPage(

                    item: onboardingItems[index],

                  );

                },

              ),

            ),



            Row(

              mainAxisAlignment: MainAxisAlignment.center,

              children: List.generate(

                onboardingItems.length,

                (index) {

                  return AnimatedContainer(

                    duration: const Duration(
                      milliseconds: 300,
                    ),

                    margin: const EdgeInsets.symmetric(
                      horizontal: 5,
                    ),


                    width: currentPage == index
                        ? 28
                        : 8,


                    height: 8,


                    decoration: BoxDecoration(

                      borderRadius:
                          BorderRadius.circular(10),

                      color: currentPage == index
                          ? Colors.black
                          : Colors.grey,

                    ),

                  );

                },

              ),

            ),



            const SizedBox(
              height: 30,
            ),



            Padding(

              padding:
                  const EdgeInsets.symmetric(
                    horizontal: 30,
                  ),

              child: Column(

                children: [


                  SizedBox(

                    width: double.infinity,

                    height: 55,


                    child: ElevatedButton(

                      onPressed: nextPage,


                      child: Text(

                        currentPage ==
                                onboardingItems.length - 1
                            ? "Comenzar"
                            : "Continuar",

                      ),

                    ),

                  ),



                  TextButton(

                    onPressed: skip,


                    child: const Text(
                      "Saltar",
                    ),

                  ),

                ],

              ),

            ),


            const SizedBox(
              height: 20,
            ),


          ],

        ),

      ),

    );

  }

}