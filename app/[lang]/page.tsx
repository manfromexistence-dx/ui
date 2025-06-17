
"use client";

import { useState } from "react";
import { LiquidGlassDemo } from "@/components/layout/liquid-glass-demo";
import { LiquidGlass } from "@/components/layout/liquid-glass";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Twitter } from "lucide-react";

export default function HomePage() {
  const backgrounds = [
    {
      name: "Vector Winds",
      url: "https://i.ibb.co/MDbLn4N4/vectors.png",
      description: "Abstract vector pattern"
    },
    {
      name: "Spring Flowers",
      url: "https://img.freepik.com/free-vector/flat-floral-spring-pattern-design_23-2150117078.jpg",
      description: "Colorful spring floral pattern"
    },
    {
      name: "Green Mistletoe",
      url: "https://media.istockphoto.com/id/1430511443/vector/christmas-mistletoe-foliage-and-berries-vector-seamless-pattern.jpg?s=612x612&w=0&k=20&c=oqxlH7ytgd5yjBQroACirJ1gH7Au1tq8gmsdeGd-Crk=",
      description: "Christmas mistletoe pattern"
    },
    {
      name: "Orange Flowers",
      url: "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/beautiful-orange-and-pastel-flowers-seamless-pattern-julien.jpg",
      description: "Orange and pastel floral pattern"
    },
    {
      name: "Margaritas",
      url: "https://static.vecteezy.com/system/resources/previews/056/652/082/non_2x/hand-drawn-white-flower-seamless-pattern-floral-repeating-wallpaper-for-textile-design-fabric-print-wrapping-paper-cute-daisy-flowers-on-blue-background-repeated-ditsy-texture-vector.jpg",
      description: "White daisy flowers on blue"
    },
    {
      name: "Red Flowers",
      url: "https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg",
      description: "Red floral wallpaper pattern"
    },
  ];

  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0]);

  const [animationActive, setAnimationActive] = useState(true);

  const backgroundStyle = {
    // backgroundImage: `url(${selectedBackground.url})`,
    backgroundImage: `url(./ios-26-dark.jpg)`,
    // backgroundSize: "500px",
    backgroundPosition: "center center",
    animation: animationActive ? "moveBackground 600s linear infinite" : "none",
  };

  return (
    <main
      className="min-h-full p-16 font-serif text-primary min-w-full"
      style={backgroundStyle}
    >
      {/* <div className="mx-auto max-w-screen-lg space-y-2 text-center">
        <h1 className="text-3xl font-bold">Liquid Glass</h1>
        <Link href="https://x.com/manfrexistence" className="mx-auto flex w-max items-center justify-center gap-2 rounded-md border bg-background p-1.5 backdrop-blur-sm">
          manfromexistence
          <Twitter className="size-4" />
        </Link>
        <div className="mb-8 flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background/70 backdrop-blur-sm">
                {selectedBackground.name}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {backgrounds.map((bg) => (
                <DropdownMenuItem
                  key={bg.name}
                  onClick={() => setSelectedBackground(bg)}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div>{bg.name}</div>
                    <p className="text-xs text-muted-foreground">{bg.description}</p>
                  </div>
                  {selectedBackground.name === bg.name && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => setAnimationActive(!animationActive)}
                className="mt-2 flex items-center justify-between border-t pt-2"
              >
                <div>
                  <div>{animationActive ? "Pause Animation" : "Play Animation"}</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div> */}

      {/* <LiquidGlassDemo /> */}

      
      <LiquidGlass />

      {/* <div className="h-50 w-60 rounded-md mx-auto border p-4">
        <div className="h-1/2 w-full bg-white"></div>
        <div className="h-1 w-full bg-border"></div>
        <div className="h-1/2 w-full bg-black"></div>
      </div>

      <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate, corrupti vel, delectus quasi molestias, itaque placeat praesentium laborum nisi ipsam facere. Unde distinctio explicabo cumque fuga odit ipsa vel dolores.
        Et dolorum maiores, eaque alias quidem laudantium! Ullam dignissimos tenetur dolor reprehenderit in, quam nostrum atque adipisci vero nihil neque ipsam? Rerum similique accusamus facere, sapiente libero sint quo dolor!
        Esse quis excepturi harum provident, tempora fugiat quibusdam velit nisi quae, ullam, obcaecati necessitatibus libero blanditiis! Voluptas nostrum qui, facere harum magnam perferendis ipsa blanditiis voluptate minus. Harum, dicta esse.
        Eligendi aperiam distinctio maxime! Saepe reiciendis, illum in suscipit quo fugiat maxime quidem iure, consequuntur laborum animi explicabo aut incidunt accusamus vel aperiam sit repudiandae labore! Corrupti soluta atque voluptate.
        Magnam unde sequi ipsa eaque ut nulla incidunt quae, natus, sunt doloremque in blanditiis placeat facilis mollitia. Quos optio quibusdam architecto provident, voluptas numquam eum nobis placeat saepe dolore? Quo!
        Nemo temporibus eveniet, veritatis officia iure quaerat laborum delectus porro earum facere qui, dicta cum ducimus itaque! Reprehenderit sapiente voluptates voluptate possimus quo, itaque quibusdam praesentium debitis accusamus dolore obcaecati.
        Vero, at nobis dolorem veniam perspiciatis corporis quia dignissimos quod deserunt in ab perferendis ipsa quaerat accusantium debitis tempore totam vel ad necessitatibus est animi, mollitia, natus iure quibusdam! Molestiae.
        Hic illo, magnam velit magni nesciunt consectetur est tenetur eveniet dolor consequuntur, omnis fugit atque voluptates officia quisquam nostrum delectus ab? Atque asperiores nemo reiciendis architecto placeat eum ducimus a.
        Natus aliquam sit eveniet unde eius, vitae consequatur accusamus, ea dicta aliquid minus tempore amet! Quas facilis, harum expedita quia veniam minima nemo deserunt odio, eligendi dignissimos quis reprehenderit hic?
        Libero doloribus fugit, ipsam quas repellendus, debitis accusamus ullam inventore sint, excepturi voluptates aliquid. Quos ipsum, quasi quo tempora non quaerat dicta laudantium odit ab, labore quibusdam error quidem unde.
        Porro modi nostrum aliquid cumque fugiat nemo in dolor? Odit commodi, veniam hic consequuntur modi enim, deleniti quis velit illum doloremque nobis sequi molestiae architecto ipsum totam vel magni quas?
        Quisquam excepturi quaerat ea, quos et modi deleniti sint, impedit tempore aspernatur eius aliquam ab aut necessitatibus eum. Fugit quae repudiandae odit repellat. Officia sint tempora qui adipisci exercitationem aut!
        Officia reiciendis aperiam dolor praesentium amet expedita quibusdam cum molestias incidunt, commodi quam tempore architecto impedit dolore quaerat non porro aliquam maiores, enim eius earum repellendus autem odit. Minima, suscipit.
        Aut, suscipit consectetur error minus dignissimos labore itaque ratione sint repellat quidem omnis reprehenderit non id quia recusandae quam tempora at laboriosam nihil expedita provident aspernatur ipsam nisi. Maiores, a.
        Minus veniam accusantium sapiente odio tenetur deleniti reiciendis temporibus velit numquam odit corrupti tempore tempora fugit ipsam non, et unde maiores qui alias magni aperiam quod vitae error. Necessitatibus, exercitationem.
        Odit recusandae et saepe aperiam illum voluptates aut nam, ratione officia veniam officiis impedit blanditiis adipisci laborum odio, est quisquam vitae iste quod ipsam repellat fugiat nulla neque? Quisquam, laborum.
        Illo asperiores nemo nulla nesciunt blanditiis quo expedita fuga eum earum accusamus ut quibusdam molestiae repellendus minima inventore deserunt, saepe maxime aliquam consequuntur distinctio laboriosam ea perferendis rerum? Ipsum, reiciendis.
        Consequuntur porro cupiditate culpa quas saepe nobis aperiam quae, quisquam doloribus quibusdam corporis sit! Illum commodi ut unde cum accusantium minus sunt necessitatibus assumenda error, quis fugiat doloribus at rerum!
        Obcaecati at aspernatur magnam optio itaque quidem consectetur nesciunt deleniti distinctio. Ipsam, illo et autem aliquam corporis harum sed in modi repellendus sit ab impedit adipisci, velit commodi? Quas, corrupti?
        Magni, accusamus. At aut autem explicabo non laborum asperiores repellendus neque quaerat nulla praesentium vitae, nam dolore, a sint, recusandae similique debitis. Accusantium et perferendis eos autem in quo vel.
        Nesciunt sit corporis dolores vero voluptatem dolore assumenda eaque ad debitis laudantium quia odit corrupti cupiditate culpa quibusdam magni voluptatibus, aut optio eos, similique, nobis fugiat nulla voluptatum ipsam! Necessitatibus?
        Incidunt accusamus ipsum eaque est consequuntur repellendus, iure eligendi voluptas vero culpa debitis optio ipsa dolorem pariatur voluptate sapiente sequi aspernatur. Excepturi, labore beatae nostrum enim error cumque alias quisquam?
        Aliquid quisquam aperiam exercitationem repudiandae eaque provident excepturi in autem corrupti officiis facere ad repellat dignissimos asperiores commodi voluptatibus tempore voluptates veritatis quasi sequi consectetur, quidem fugit debitis eum. Tenetur.
        Odio delectus quis commodi voluptas debitis quibusdam repellendus saepe eligendi doloremque beatae laboriosam perferendis reiciendis quia maxime asperiores, obcaecati dolore voluptatibus? Ipsum deleniti expedita delectus tempora modi numquam eum omnis.
        Consequuntur fugit delectus neque facere at praesentium similique blanditiis nihil, voluptate officiis id deleniti soluta debitis harum rerum, necessitatibus iste nam fugiat temporibus doloremque minima laborum voluptatem molestiae? Asperiores, aliquam?
        A ullam necessitatibus, consectetur consequatur commodi, totam ipsam quia recusandae dolorum tempore inventore dicta nobis, quisquam culpa? Quasi sed veritatis placeat harum in! Accusantium omnis maiores quis iste dicta soluta.
        Architecto ex rerum, corporis repellat officia dolore assumenda quae doloribus totam a. Dolor earum facilis atque nihil officia voluptate, neque placeat quasi, temporibus, sint sequi porro a suscipit impedit quos.
        Nesciunt eaque unde autem repellendus culpa, soluta, velit voluptas nam consequuntur veritatis voluptatibus possimus minima facere non vel, distinctio saepe. Facere exercitationem, sed totam vel hic quisquam necessitatibus ea rerum.
        Repellendus aspernatur rerum praesentium numquam itaque autem vel ab optio fugit veritatis architecto nihil fugiat harum voluptas, officia, natus magnam, inventore aliquam sunt esse culpa assumenda reprehenderit! Velit, voluptatibus molestiae!
        Eum vero repellendus unde corporis eius sit libero delectus, natus numquam possimus ipsam minus expedita animi soluta rem porro mollitia accusamus nisi ea ex fugiat vel. Excepturi nostrum est deleniti.
        Sit eligendi labore sint molestiae, voluptatum voluptate. Eos, rerum iure! Ab vitae harum blanditiis tempora! Optio enim consequatur, fugiat, accusamus odit eaque beatae quisquam ipsum tempora magnam vero maxime veritatis?
        Voluptatum molestiae atque quasi corrupti harum tempore aperiam veritatis repellat ab voluptatem vel nemo dolore deserunt eveniet non, autem quos cupiditate, laboriosam eligendi rerum ratione quam laborum et. Repellendus, perspiciatis.
        Quibusdam aspernatur dolore esse molestiae rerum dignissimos aliquid similique quas. Nostrum obcaecati necessitatibus dolores? Animi, eos sapiente? Dolorem recusandae facere repudiandae labore exercitationem, eos maxime eaque minima? Esse, optio doloribus.
        Dolorum, suscipit? Quasi dolorum repudiandae, doloribus nihil aperiam porro dolores vel exercitationem, eius fugit debitis ab ea incidunt! Libero repudiandae obcaecati earum veritatis odit in temporibus rerum repellat ipsam unde.
        Veritatis ad in labore eos? Nulla quasi odio pariatur magni soluta, quo aut officia cupiditate earum dolore fuga provident ab natus optio placeat reprehenderit numquam, nobis beatae delectus veniam sit!
        Obcaecati doloribus quidem tempora adipisci sit quia voluptatum, facilis enim corporis unde. Ab, rerum? Ipsum iusto dolorum aliquam ratione iure? Placeat, in! Accusamus quasi velit natus molestiae nobis ullam. Odit?
        Alias, itaque reprehenderit repudiandae hic architecto at consequuntur consectetur saepe laboriosam dignissimos atque iste omnis aperiam quasi cupiditate vero neque sapiente dolorum adipisci fugiat! Earum cumque maxime cupiditate obcaecati expedita.
        Nisi, maiores. Iste est exercitationem, sunt assumenda similique, deleniti voluptates minus corrupti recusandae veritatis, quis voluptatem enim autem laudantium nihil? Eum adipisci numquam iste dolor id esse tenetur, aut quia.
        Sed quae numquam minus praesentium, sit aut est, deserunt at ipsam dolores cumque asperiores blanditiis ea eius consequatur nam incidunt ducimus magnam fugiat, mollitia iusto vel adipisci corrupti. Unde, in!
        Cumque eum vel, aperiam ipsum quidem veniam natus dolor vitae adipisci porro commodi nostrum odio, ullam praesentium nulla ex culpa ad, aut veritatis! Reiciendis eius, corporis doloremque nostrum fuga aperiam!
        Dicta repellendus expedita commodi harum corporis magni inventore, cupiditate quidem hic quasi quo, quia ducimus veritatis ipsam necessitatibus illum doloremque? Nam dignissimos dolore quod velit accusamus veniam magni aperiam libero?
        Amet dolor provident alias temporibus sunt recusandae eaque culpa, eligendi dolorem odio nemo totam quidem illum, unde exercitationem sit. Nulla, sint nostrum? Sapiente, odio incidunt modi dicta expedita cupiditate quas?
        Itaque officiis quas amet impedit autem, aliquid obcaecati illo quibusdam inventore sint labore, perferendis dolorem a laudantium rem eum. Atque aut eius enim laborum? Minima praesentium optio dolorem sequi aut?
        Illo itaque placeat ipsum laborum, qui minus, animi officia necessitatibus sit id nemo facilis quod inventore molestiae eaque aliquam! Fuga illo vero nesciunt, perferendis quam ipsam iusto ex pariatur architecto?
        Maiores quia ullam aspernatur ducimus tempore! Ad praesentium delectus eos adipisci. Voluptatibus et quidem fugit eaque cum corporis velit eligendi pariatur non quas. Itaque quo nisi aliquid ea tempore doloribus.
        Doloribus consequatur quia reiciendis autem iusto natus sit deserunt tempora vel similique esse reprehenderit distinctio dolorem dignissimos aut quaerat, aliquid atque corporis, necessitatibus eligendi. Vitae repudiandae aut harum sint incidunt!
        Rem possimus deleniti consequuntur, dicta a deserunt tempore ratione voluptatem voluptatibus, eaque atque explicabo iste! Beatae, veniam debitis quidem fugit doloribus commodi architecto dolorum esse laborum quod! Quisquam, molestias blanditiis?
        Ad quisquam quos minima voluptatem, ea nam dolorem fugiat exercitationem qui officiis aspernatur expedita laudantium obcaecati quae odit voluptatum, sint ut ipsam earum. Quam velit eveniet, architecto sed quo omnis?
        Eligendi repellendus unde mollitia id eveniet, delectus dolores rem exercitationem iusto ducimus odit quos, illo eaque vitae. Iure, labore. Nostrum nobis laudantium voluptates. Voluptates ipsum, minima voluptate quam inventore suscipit!
        Ab accusantium tenetur eius corporis nemo, culpa natus delectus ex obcaecati veniam est suscipit expedita quo laborum harum, optio fugiat minima saepe numquam aspernatur aliquid, beatae minus dolor totam. Distinctio.
        Excepturi nihil doloremque eaque itaque, corporis impedit autem recusandae, dolor alias nemo et dolores error ut nesciunt officia repellendus. Numquam omnis nisi quis quos ex consequuntur cupiditate assumenda veritatis. Nostrum.
        Eligendi in expedita perspiciatis vero facere. Sequi necessitatibus praesentium saepe repellendus adipisci numquam, quo assumenda dicta totam quisquam similique, dolorem nam sapiente quis consequatur accusamus recusandae! Repudiandae nobis non asperiores?
        Corrupti nam in adipisci assumenda quibusdam repudiandae voluptatem eius placeat minus aliquam mollitia, eligendi nisi doloribus, qui minima, sint aperiam quam possimus! Vitae distinctio inventore ad nisi fugiat quam incidunt?
        Aperiam earum omnis deleniti veniam, corporis reprehenderit non porro, aliquam harum nisi id iusto animi iste architecto a. Temporibus ratione minima molestias corrupti alias magnam voluptas amet quasi, vitae blanditiis?
        Tenetur culpa, nobis soluta non, provident nemo blanditiis fugit quod placeat odio repellat ipsum. Reiciendis, provident veniam officia at vitae maiores facere incidunt corrupti deserunt perspiciatis doloribus culpa beatae tempora!
        Harum ipsa dignissimos deserunt ex quibusdam minima exercitationem, totam molestias saepe sequi dicta quaerat non impedit necessitatibus! Expedita itaque quasi eveniet eum nobis animi sint voluptates! Quasi, sapiente temporibus? Consequatur.
        Ex veniam nesciunt distinctio minus libero corrupti dolor autem? Necessitatibus, animi? Accusamus in suscipit assumenda ad, nobis illo id, ea odio inventore a fuga cumque soluta eligendi. Voluptatibus, recusandae harum.
        Eligendi, necessitatibus. Suscipit, dolorum? Neque beatae assumenda mollitia eum similique tenetur, accusantium quaerat ducimus non molestiae corrupti quas, modi, et voluptatem optio? In totam adipisci debitis! Maiores veniam esse numquam!
        Modi saepe assumenda molestiae esse quasi, non excepturi corporis nisi unde atque pariatur repudiandae sit hic alias id mollitia optio laboriosam facere quia perferendis quam! Iure odio commodi error sequi?
        Rerum, facere similique et esse quia voluptatem fugit cum nulla porro fuga iste doloremque qui laudantium eaque commodi error sunt, culpa deserunt distinctio aliquam ducimus quaerat veritatis cumque earum. Animi.
        Veniam maxime accusamus quam vero, quis asperiores inventore a? Incidunt, similique nobis aspernatur qui assumenda dolor fugiat mollitia asperiores odit amet. Doloremque, non laboriosam? Reiciendis voluptatem sit quos architecto at.
        Dolor molestias ipsa fugiat et distinctio fuga doloremque a voluptatibus dignissimos nostrum veritatis alias aut corporis unde, molestiae nam dolorem labore odio. Nostrum adipisci dolor vero odio voluptatem. Vel, ipsum?
        Ut doloribus ipsa, exercitationem dicta et assumenda cumque dolorem illum. Explicabo recusandae placeat omnis quibusdam iste perferendis dicta quos sint quo asperiores, a ex necessitatibus impedit nobis corporis maiores deserunt!
        Esse saepe error sint expedita deserunt consectetur. Corrupti laboriosam nisi enim fugiat alias! Itaque praesentium soluta illum facilis modi, cumque ut architecto deserunt. Quas enim id molestias amet nulla quia!
        Doloribus dolores reprehenderit quibusdam distinctio quo incidunt recusandae rerum autem. Ut exercitationem, at suscipit quas consequuntur magni nihil velit magnam dolor sequi earum totam, fuga sed eum ea optio placeat.
        Natus molestias tenetur mollitia rem sint laborum iste assumenda maxime veniam accusantium, animi corrupti dolore voluptates cum maiores dicta enim nihil, officia, optio praesentium. Velit molestiae aperiam possimus saepe sint.
        Odit delectus architecto amet aperiam laborum, iste velit optio libero illum, recusandae ipsa dolorem at, quaerat quam voluptates? Dolorum obcaecati at minus excepturi dicta culpa, ut nisi sed soluta explicabo!
        Asperiores velit neque facere hic, dignissimos nam magni ea consequatur corrupti cupiditate, repellendus eligendi iure alias ipsa fugiat! Id ratione blanditiis repellendus voluptates voluptatibus beatae sunt aut! Eveniet, tempore impedit.
        Blanditiis laudantium asperiores alias fuga enim, voluptatibus, repellendus corporis illo harum dolore animi, impedit deleniti dicta! Quaerat, fuga sunt ducimus temporibus cupiditate nobis vel rerum voluptas fugit suscipit. Animi, illum!
        Sit culpa incidunt, repellat nisi sapiente harum, aspernatur doloribus, commodi dicta ut animi cumque error! Reprehenderit odio blanditiis id nam! Soluta iure repellendus, repellat recusandae numquam perferendis. Dignissimos, odit numquam.
        Repellendus accusamus at temporibus recusandae dolorem ipsum, suscipit ratione minus aliquid, veniam, vero nisi hic non ad illum ab distinctio aperiam velit? Reiciendis dolorem repellat excepturi ea ad, eos voluptate.
        Assumenda officia doloribus dolores aliquid cupiditate alias, aperiam provident esse a vel corporis obcaecati neque nobis voluptates recusandae laboriosam, quos eligendi, blanditiis harum libero nisi? Officiis voluptatum dolore fuga dignissimos.
        Necessitatibus minima dolorem, dicta quasi perferendis perspiciatis ullam beatae! Amet culpa dignissimos cumque earum fugit quidem ex doloribus laboriosam maiores. Libero aspernatur quae enim blanditiis earum magnam delectus amet possimus.
        Numquam, unde placeat! Harum itaque temporibus possimus quam ipsa, pariatur optio adipisci cumque quaerat? Optio non animi nobis ducimus voluptates, cum a exercitationem odio laudantium, voluptate minus quae nam dolorem?
        Dolore exercitationem est cum officiis veniam in deleniti expedita quae esse ipsa! Dolores, quod impedit? Illo et nihil ea totam voluptates, repellendus praesentium laboriosam laborum aliquid, aspernatur odit earum similique!
        Nulla quos aliquid commodi, sunt veritatis maxime tempora consectetur dolorem laborum, numquam vitae fugiat corrupti nam natus quia ad quibusdam alias libero repellat dolorum quam quidem! Quia doloribus officia hic!
        Tempora tenetur, nesciunt excepturi eos aspernatur illo, sint consequatur odit sequi, accusamus explicabo. Repellat atque delectus voluptatibus maxime, molestias dicta laudantium odit laboriosam rem at temporibus ea? Ratione, sunt et?
        Laudantium adipisci animi sunt et quibusdam! Minus quae sunt illo omnis laboriosam ullam, dicta eum odio ipsam eaque reprehenderit, voluptas itaque, culpa nostrum quasi molestiae. Optio atque doloremque ducimus vel?
        Vero, et! Voluptatibus, modi qui. Neque temporibus ipsa quibusdam aspernatur accusamus quae accusantium recusandae laborum sapiente culpa possimus beatae, officiis exercitationem qui praesentium eos eum voluptatibus. Eligendi voluptate sed quibusdam.
        Aliquam, quidem veniam illo fugit itaque distinctio commodi, modi deleniti neque mollitia nulla animi debitis tempore dolorum repudiandae deserunt? Consequatur blanditiis dolores expedita pariatur accusamus, ullam doloremque dolorem illo ea!
        Omnis nisi repellendus nobis delectus nam sapiente excepturi totam, provident libero quaerat similique ullam eligendi, vero dolorem? Consequuntur vel necessitatibus tenetur provident voluptatibus, qui accusantium impedit, labore et expedita dolore?
        Laborum nisi molestias repellat corporis nemo, quod nulla magni recusandae vero veritatis explicabo, aliquam itaque quia repudiandae beatae optio. Officiis, esse sunt? Accusamus voluptates perspiciatis nisi laboriosam eveniet incidunt eligendi.
        Incidunt hic voluptates perferendis iste delectus. Suscipit earum ipsum molestias, vel ad fuga aperiam, corrupti iste harum nobis porro placeat. Assumenda exercitationem aliquam, repellat tempore laudantium autem. Tenetur, deserunt cupiditate!
        Animi eaque doloremque incidunt quas sit. Saepe culpa facilis reprehenderit doloremque ducimus reiciendis voluptatibus nisi fugit, soluta itaque numquam, quis alias consequatur eos dolore! Iure commodi nemo nam pariatur optio?
        Laboriosam sit perferendis temporibus veniam vero repellendus non fuga quo praesentium natus amet sed culpa repellat dolore magni, deleniti minus sint doloribus porro voluptas impedit itaque consectetur. Optio, a soluta?
        Perferendis deserunt labore sequi doloribus maxime, necessitatibus inventore debitis illum eligendi nulla quo, quos, mollitia excepturi hic accusamus totam asperiores ipsum id eum nemo. Ducimus blanditiis perferendis dignissimos dolores pariatur.
        Reprehenderit velit blanditiis beatae nobis hic porro maiores sapiente ipsum iure et a amet, quam eum possimus esse, cumque dicta aperiam nemo sequi consectetur atque tempora molestiae magnam qui. Fugit?
        Harum aut aspernatur modi recusandae fugiat illo veniam. Unde culpa quos eos, nemo sed ipsa tempora facilis tenetur cumque corrupti sunt quaerat explicabo assumenda fugiat fugit incidunt enim accusamus magni!
        Deleniti fugiat a deserunt ab veritatis aspernatur, eius ex cum facilis asperiores soluta quia totam tempora! Cum laboriosam, neque dolore illum commodi at recusandae sapiente omnis odit veniam, voluptatem nihil?
        Dicta earum dolore vero quo rem non eos commodi est harum. Delectus dignissimos voluptate, facere officiis laborum et quas commodi quia harum non cupiditate earum ullam iure necessitatibus maxime corrupti!
        Ea sequi atque accusamus cumque sunt, illum, nostrum dolore consectetur dolorum harum ipsa. Minima illum consequuntur ipsam, maxime quae asperiores eum est voluptatem culpa dolorum, id ad consequatur iure adipisci.
        Nostrum atque delectus laborum ut sunt architecto exercitationem explicabo cupiditate sint autem. Odit, cum. Iste sit dolorum ea, fuga neque illum adipisci sequi harum molestiae perferendis unde quae voluptatum reprehenderit.
        Praesentium pariatur totam, quia recusandae harum sequi dolorem, facere nemo beatae omnis voluptas sapiente unde fugiat eius doloribus voluptatum, impedit consectetur facilis non possimus earum molestias molestiae provident dolore? Nulla!
        Aliquam, dolor asperiores laborum provident quia iste facilis! Libero magnam beatae, minus doloremque consectetur dolores! Expedita et accusantium repudiandae voluptates sapiente animi, molestiae cupiditate nihil libero atque debitis aut officiis.
        Magnam in eveniet deleniti consequuntur rem nostrum totam corrupti laborum exercitationem eaque eius quae soluta expedita sequi tempora amet maiores numquam, architecto libero officia? Nam harum quae voluptatem obcaecati laboriosam!
        Enim voluptatibus aperiam quisquam rerum inventore corrupti consequatur eveniet cumque, expedita nesciunt dolorem facere debitis, dolores quos eaque aut in accusantium illo dignissimos maiores. Deleniti mollitia tempore eveniet rerum consectetur!
        Soluta pariatur ea vitae sequi debitis esse iure ullam tempore quam nulla? Harum explicabo ipsum sapiente, hic, voluptas placeat omnis deserunt soluta ea dolore eum ipsa, natus quam accusamus nulla?
        Accusantium, in sint! Doloribus voluptatibus sed quod! Porro commodi et laudantium, inventore cum quos veritatis nihil dignissimos illum quo ea. Tempora error numquam, animi ducimus sit esse officia repellat nulla?
        Reprehenderit eos fuga, ipsam architecto recusandae et, necessitatibus vitae ex libero alias sit odit reiciendis numquam doloremque provident impedit beatae dolorem. Soluta vitae deleniti inventore obcaecati animi molestias, illo alias.
        Neque quibusdam asperiores quidem consequuntur voluptate. Repellendus libero corporis at sunt, eos laboriosam voluptas necessitatibus unde deserunt deleniti temporibus, aliquam, magnam accusantium. Incidunt repudiandae impedit fugit libero in. Suscipit, veniam.</span> */}

      {/* <LiquidGlass /> */}
      {/* <LiquidGlass>
        <span className="text-rose-500">Hello</span>
      </LiquidGlass> */}

      {/* <style jsx global>{`
        @keyframes moveBackground {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 0% -1500%;
          }
        }
      `}</style> */}
    </main>
  );
}
